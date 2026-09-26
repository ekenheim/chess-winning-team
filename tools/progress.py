"""The shared ledger, Elo chart and scoreboard, rebuilt from the git log.

The git history is the experiment log (see program.md). This reads every
`autoresearch/*` branch (origin's copy, or the local one when it is ahead)
along its first-parent line, so merges from main never re-attribute or hide
anything, plus the `[promote]` and `[ladder]` commits on origin/main, and
writes:

    LEDGER.md      who tried what, on which host, with what result, whether
                   it is in the champion engine on main, and what is in flight
    progress.svg   one dot per experiment, kept ones labelled, running best
    README.md      the scoreboard between the progress:start/end markers

    git fetch origin && python tools/progress.py          # on main only
    git fetch origin && python tools/progress.py --print  # ledger to stdout,
                                                          # writes nothing

Standard library only, so it runs on both machines with no installs. The
written files are generated on main only, by `python tools/team.py publish`;
experiment branches never commit them, so they never conflict.
"""

import html
import re
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SVG_PATH = ROOT / "progress.svg"
LEDGER_PATH = ROOT / "LEDGER.md"
README_PATH = ROOT / "README.md"
START, END = "<!-- progress:start -->", "<!-- progress:end -->"

RESULT_RE = re.compile(
    r"^\[(?P<status>keep|discard|crash|FULL|sync)\]\s+"
    r"(?:elo=(?P<elo>-?[\d.]+)±(?P<err>[\d.]+)\s+"
    r"W/D/L=(?P<w>\d+)/(?P<d>\d+)/(?P<l>\d+)\s+"
    r"@(?P<target>\d+)\s+wins@target=(?P<wins>\d+)\s+)?"
    r"(?:—|-{1,2})\s*(?P<desc>.*)$")
LADDER_RE = re.compile(r"^\[ladder\]\s+TARGET_ELO\s+\d+\s*(?:->|→)\s*(\d+)\s*"
                       r"(?:—|-{1,2})?\s*(?P<desc>.*)$")
HOST_RE = re.compile(r"^host:\s*([\w.-]+)", re.MULTILINE)
FROM_RE = re.compile(r"^from:\s*(?:autoresearch/)?([\w.-]+)@", re.MULTILINE)
EXP_RE = re.compile(r"^\[exp\]\s*(?:—|-{1,2})\s*(?P<desc>.*)$")
PROMOTE_RE = re.compile(
    r"^\[promote\]\s+(?P<branch>[\w.-]+)@(?P<sha>[0-9a-f]{7,40})\s+"
    r"elo=(?P<elo>-?[\d.]+)±(?P<err>[\d.]+)\s+@(?P<target>\d+)\s+"
    r"host=(?P<host>[\w.-]+)\s*(?:—|-{1,2})\s*(?P<desc>.*)$")
RUNS = ("keep", "discard", "crash", "sync")

COLORS = ["#2a78d6", "#d9622b", "#1f9e6e", "#9b4dca"]
GREY = "#c4c7cc"
INK, MUTED, GRID = "#1d1f23", "#6b7078", "#e6e8eb"


def git(*args):
    return subprocess.run(["git", *args], cwd=ROOT, capture_output=True,
                          encoding="utf-8", check=True).stdout


def ok(*args):
    return subprocess.run(["git", *args], cwd=ROOT, capture_output=True).returncode == 0


def base():
    """The shared main: origin's when it exists, so both machines agree."""
    return "origin/main" if ok("rev-parse", "-q", "--verify", "origin/main") else "main"


def branches():
    """Map run name -> ref. Origin's copy, unless the local branch is ahead of it
    (a local branch that is behind, e.g. an old checkout of the teammate's, would
    silently freeze their row)."""
    refs = git("for-each-ref", "--format=%(refname)",
               "refs/heads/autoresearch/", "refs/remotes/origin/autoresearch/")
    local, remote = {}, {}
    for ref in refs.split():
        name = ref.split("autoresearch/", 1)[1]
        (local if ref.startswith("refs/heads/") else remote)[name] = ref
    found = dict(remote)
    for name, ref in local.items():
        if name not in remote or ok("merge-base", "--is-ancestor", remote[name], ref):
            found[name] = ref
    return found


def log_rows(ref, exclude=frozenset()):
    """(sha, author, time, body) along the first-parent line of `ref`, oldest first."""
    out = git("log", "--first-parent", "--reverse",
              "--format=%H%x1f%an%x1f%ct%x1f%B%x1e", ref)
    for entry in out.split("\x1e"):
        if not entry.strip():
            continue
        sha, who, ts, body = entry.strip().split("\x1f", 3)
        if sha not in exclude:
            yield sha, who, int(ts), body


def main_line():
    """Commits on main's own first-parent line: they belong to no branch."""
    return frozenset(git("rev-list", "--first-parent", base()).split())


def parse(sha, who, ts, body):
    subject = body.splitlines()[0] if body else ""
    host, origin = HOST_RE.search(body), FROM_RE.search(body)
    row = {"sha": sha[:7], "full": sha, "who": who, "time": ts, "body": body,
           "host": host[1] if host else None, "subject": subject,
           "origin": origin[1] if origin else None,
           "elo": None, "err": None, "wins": 0, "target": None}
    ladder = LADDER_RE.match(subject)
    if ladder:
        return {**row, "status": "ladder", "desc": ladder["desc"].strip(),
                "target": int(ladder[1])}
    m = RESULT_RE.match(subject)
    if m:
        return {**row, "status": m["status"], "desc": m["desc"].strip(),
                "elo": float(m["elo"]) if m["elo"] else None,
                "err": float(m["err"]) if m["err"] else None,
                "target": int(m["target"]) if m["target"] else None,
                "wins": int(m["wins"]) if m["wins"] else 0}
    m = EXP_RE.match(subject)
    if m:
        hyp = next((l.strip() for l in body.splitlines()[1:] if l.strip()), "")
        hyp = re.sub(r"^hypothesis:\s*", "", hyp, flags=re.I)
        return {**row, "status": "exp", "desc": m["desc"].strip(), "hypothesis": hyp}
    m = PROMOTE_RE.match(subject)
    if m:
        return {**row, "status": "promote", "desc": m["desc"].strip(),
                "branch": m["branch"], "from": m["sha"], "host": m["host"],
                "elo": float(m["elo"]), "err": float(m["err"]),
                "target": int(m["target"])}
    return None


def experiments(ref, exclude=None):
    """Result commits on a branch's own first-parent line, oldest first.
    Commits on main's first-parent line (before the fork, or reached
    through it) are not the branch's."""
    exclude = main_line() if exclude is None else exclude
    rows = [parse(*r) for r in log_rows(ref, exclude)]
    return [r for r in rows if r and r["status"] != "promote"]


def champion():
    """`[promote]` and `[ladder]` commits on main, oldest first."""
    rows = [parse(*r) for r in log_rows(base())]
    return [r for r in rows if r and r["status"] in ("promote", "ladder")]


def mark_state(name, rows, promotions):
    """Where each result's engine ended up:
    in main   promoted (directly, or an earlier keep under a promoted one with
              no [sync] between them: a sync replaces the engine wholesale)
    dropped   kept, but a later [sync] replaced the engine before it was promoted
    branch    kept, not promoted yet (worth promoting, or re-trying on the champion)
    reverted  discarded or crashed
    champion  a [sync]: main's engine re-benched on this host"""
    promoted = {p["from"] for p in promotions if p["branch"] == name}
    for i, r in enumerate(rows):
        if r["status"] in ("discard", "crash"):
            r["state"] = "reverted"
        elif r["status"] == "sync":
            r["state"] = "champion"  # a re-bench of main's engine on this host
        elif r["status"] == "FULL":
            r["state"] = "5 s run"
        elif r["status"] == "keep":
            r["state"] = "branch"
            for later in rows[i:]:
                if later is not r and later["status"] == "sync":
                    r["state"] = "dropped"
                    break
                if any(later["full"].startswith(p) for p in promoted):
                    r["state"] = "in main"
                    break
        else:
            r["state"] = ""


def branch_logs():
    """{branch: result rows}, each commit credited to exactly one branch.
    A branch started from another branch's tip shares that branch's line; a
    shared commit belongs to the branch whose own (unshared) commits have the
    same author, else to the branch with the shorter line (the original)."""
    exclude = main_line()
    lines = {name: experiments(ref, exclude) for name, ref in sorted(branches().items())}
    shas = {name: {r["full"] for r in rows} for name, rows in lines.items()}
    owner = {}
    for name, rows in lines.items():
        for r in rows:
            owner.setdefault(r["full"], []).append(name)
    authors = {name: {r["who"] for r in rows if len(owner[r["full"]]) == 1}
               for name, rows in lines.items()}

    def pick(sha, who):
        cands = owner[sha]
        if len(cands) == 1:
            return cands[0]
        same = [c for c in cands if who in authors[c]]
        return min(same or cands, key=lambda c: len(shas[c]))

    return {name: [r for r in rows if pick(r["full"], r["who"]) == name]
            for name, rows in lines.items()}


def load():
    """Everything the outputs need, from one pass over the log."""
    series = sorted(branch_logs().items())
    series = [(name, rows) for name, rows in series if rows]
    promotions = [r for r in champion() if r["status"] == "promote"]
    for name, rows in series:
        mark_state(name, rows, promotions)
    return series, champion()


def summarize(name, rows, main_rows=()):
    runs = [r for r in rows if r["status"] in RUNS]
    keeps = [r for r in rows if r["status"] in ("keep", "sync") and r["elo"] is not None]
    fulls = [r for r in rows if r["status"] == "FULL"]
    targets = [r["target"] for r in rows if r["target"]]
    best = max(keeps, key=lambda r: r["elo"], default=None)
    best_full = max(fulls, key=lambda r: r["elo"], default=None)
    hosts = [r["host"] for r in rows if r["host"]]
    who = sorted({r["who"] for r in rows if r["status"] != "exp"})
    return {"name": name, "host": hosts[-1] if hosts else "?",
            "who": ", ".join(who) or "?",
            "runs": len(runs), "keeps": sum(r["status"] == "keep" for r in rows),
            "best": best, "best_full": best_full,
            "target": targets[-1] if targets else None,
            "wins": max((r["wins"] for r in fulls), default=0),
            # distinct levels proven: main's ladders from this branch, plus older
            # branch [ladder]s (the same level laddered again on main counts once)
            "proofs": len({lvl for r in [m for m in main_rows if m["status"] == "ladder"
                                         and m["origin"] == name]
                           + [r for r in rows if r["status"] == "ladder"]
                           for lvl in re.findall(r"beat-(\d+)", r["subject"])})}


def nice_ticks(lo, hi, count=6):
    span = max(hi - lo, 1)
    raw = span / count
    mag = 10 ** len(str(int(raw))) / 10
    step = next(s * mag for s in (1, 2, 2.5, 5, 10) if s * mag >= raw)
    start = int(lo // step) * step
    ticks, v = [], start
    while v <= hi + step:
        ticks.append(v)
        v += step
    return ticks


def render_svg(series):
    W, H = 1200, 620
    L, R, T, B = 80, 40, 70, 70
    pw, ph = W - L - R, H - T - B
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" '
           f'viewBox="0 0 {W} {H}" font-family="-apple-system,Segoe UI,'
           f'Helvetica,Arial,sans-serif">',
           f'<rect width="{W}" height="{H}" fill="#ffffff"/>']

    points = [r for _, rows in series for r in rows if r["elo"] is not None
              and r["status"] != "crash"]
    n_max = max((sum(r["status"] in RUNS for r in rows)
                 for _, rows in series), default=0)
    total = sum(sum(r["status"] in RUNS for r in rows)
                for _, rows in series)
    kept = sum(r["status"] == "keep" for _, rows in series for r in rows)
    title = (f"Elo vs Stockfish 19: {total} experiments, {kept} kept"
             if total else "Elo vs Stockfish 19: no experiments yet")
    out.append(f'<text x="{L}" y="36" font-size="20" font-weight="600" '
               f'fill="{INK}">{title}</text>')

    targets = [r["target"] for _, rows in series for r in rows if r["target"]]
    elos = [r["elo"] for r in points] + targets
    lo, hi = (min(elos) - 40, max(elos) + 60) if elos else (1000, 2000)
    yt = nice_ticks(lo, hi)
    lo, hi = yt[0], yt[-1]
    xmax = max(n_max, 1)

    def X(i):
        return L + pw * (i - 0.5) / xmax if xmax > 1 else L + pw / 2

    def Y(v):
        return T + ph * (1 - (v - lo) / (hi - lo))

    for v in yt:
        out.append(f'<line x1="{L}" x2="{L + pw}" y1="{Y(v):.1f}" y2="{Y(v):.1f}" '
                   f'stroke="{GRID}"/>')
        out.append(f'<text x="{L - 10}" y="{Y(v) + 4:.1f}" font-size="12" '
                   f'text-anchor="end" fill="{MUTED}">{v:g}</text>')
    step = max(1, round(xmax / 12))
    for i in range(1, xmax + 1, step):
        out.append(f'<text x="{X(i):.1f}" y="{T + ph + 20}" font-size="12" '
                   f'text-anchor="middle" fill="{MUTED}">{i}</text>')
    out.append(f'<line x1="{L}" x2="{L + pw}" y1="{T + ph}" y2="{T + ph}" '
               f'stroke="{MUTED}"/>')
    out.append(f'<text x="{L + pw / 2}" y="{H - 22}" font-size="13" '
               f'text-anchor="middle" fill="{MUTED}">Experiment #</text>')
    out.append(f'<text x="22" y="{T + ph / 2}" font-size="13" text-anchor="middle" '
               f'fill="{MUTED}" transform="rotate(-90 22 {T + ph / 2})">'
               f'Elo (higher is better)</text>')

    if targets:
        t = max(targets)
        out.append(f'<line x1="{L}" x2="{L + pw}" y1="{Y(t):.1f}" y2="{Y(t):.1f}" '
                   f'stroke="{INK}" stroke-dasharray="6 5" opacity="0.6"/>')
        out.append(f'<text x="{L + 4}" y="{Y(t) - 6:.1f}" font-size="12" '
                   f'fill="{INK}">TARGET_ELO {t}</text>')

    legend_x = L + 520
    for k, (name, rows) in enumerate(series):
        color = COLORS[k % len(COLORS)]
        out.append(f'<circle cx="{legend_x}" cy="31" r="5" fill="{color}"/>')
        out.append(f'<text x="{legend_x + 10}" y="35" font-size="13" fill="{INK}">'
                   f'{html.escape(name)}</text>')
        legend_x += 30 + 8 * len(name)

        i, best, path = 0, None, []
        fulls, labels = [], []
        for r in rows:
            if r["status"] in RUNS:
                i += 1
            if r["status"] == "crash" or r["elo"] is None:
                continue
            x, y = X(max(i, 1)), Y(r["elo"])
            if r["status"] == "discard":
                out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="3.5" '
                           f'fill="{GREY}"/>')
            elif r["status"] == "sync":
                # a sync adopts main's engine: the running best restarts here
                if best is not None:
                    path.append((x, Y(best)))
                best = r["elo"]
                path.append((x, y))
                labels.append((x, y, r["desc"]))
            elif r["status"] == "keep":
                if best is None or r["elo"] > best:
                    if best is not None:
                        path.append((x, Y(best)))
                    best = r["elo"]
                    path.append((x, Y(best)))
                labels.append((x, y, r["desc"]))
            elif r["status"] == "FULL":
                fulls.append((x, y))
        if path:
            path.append((X(i) if i else path[-1][0], path[-1][1]))
            d = " ".join(f"{'M' if j == 0 else 'L'}{px:.1f},{py:.1f}"
                         for j, (px, py) in enumerate(path))
            out.append(f'<path d="{d}" fill="none" stroke="{color}" '
                       f'stroke-width="2"/>')
        for x, y, desc in labels:
            out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="5" fill="{color}" '
                       f'stroke="#ffffff" stroke-width="1.5"/>')
            short = desc if len(desc) <= 42 else desc[:41] + "…"
            out.append(f'<text x="{x + 7:.1f}" y="{y - 7:.1f}" font-size="10.5" '
                       f'fill="{color}" transform="rotate(-28 {x + 7:.1f} '
                       f'{y - 7:.1f})">{html.escape(short)}</text>')
        for x, y in fulls:
            out.append(f'<path d="M{x:.1f},{y - 7:.1f} L{x + 7:.1f},{y:.1f} '
                       f'L{x:.1f},{y + 7:.1f} L{x - 7:.1f},{y:.1f} Z" '
                       f'fill="#ffffff" stroke="{color}" stroke-width="2"/>')

    out.append(f'<text x="{L + pw}" y="{H - 22}" font-size="11" text-anchor="end" '
               f'fill="{MUTED}">grey = discarded · dot = kept (0.25 s/move) · '
               f'◇ = FULL (5 s/move) · line = running best</text>')
    out.append("</svg>")
    return "\n".join(out) + "\n"


def render_table(stats, main_rows):
    lines = ["![Elo progress](progress.svg)", "",
             "| Run | Who | Host | Experiments | Kept | Best Elo (0.25 s) | "
             "Best FULL Elo (5 s) | Target | Wins@target (FULL) | Proofs |",
             "|---|---|---|---|---|---|---|---|---|---|"]
    if not stats:
        lines.append("| — | — | — | 0 | 0 | — | — | — | — | — |")
    for s in stats:
        best = (f"**{s['best']['elo']:.0f}** ±{s['best']['err']:.0f} "
                f"({s['best']['desc']})" if s["best"] else "—")
        full = (f"{s['best_full']['elo']:.0f} ±{s['best_full']['err']:.0f}"
                if s["best_full"] else "—")
        lines.append(f"| `{s['name']}` | {s['who']} | {s['host']} | {s['runs']} "
                     f"| {s['keeps']} | {best} | {full} | {s['target'] or '—'} "
                     f"| {s['wins']} | {s['proofs']} |")
    promos = [r for r in main_rows if r["status"] == "promote"]
    lines += ["", "**Champion engine on main**: " + (
        f"`{promos[-1]['branch']}@{promos[-1]['from']}` by {promos[-1]['who']}, "
        f"{promos[-1]['elo']:.0f} ±{promos[-1]['err']:.0f} on {promos[-1]['host']} "
        f"— {promos[-1]['desc']}" if promos else "the baseline (nothing promoted yet)")]
    lines += ["", "Every experiment by both of us, what it tried and where its engine "
              "went: [LEDGER.md](LEDGER.md). Elo is only comparable within one host "
              "(the Mac and the Windows PC reach different depths). Rebuilt from the "
              "git log by `python tools/progress.py` on main."]
    return "\n".join(lines)


def in_flight(rows):
    """[exp] commits that no later result names (`exp: <sha>` in its body).
    A full run announced with an empty [exp] is answered by its [FULL]."""
    later_text = ""
    out = []
    for r in reversed(rows):
        if r["status"] == "exp" and r["sha"] not in later_text:
            out.append(r)
        later_text += r["body"]
    return list(reversed(out))


def stamp(ts):
    return time.strftime("%b %d %H:%M", time.gmtime(ts)) + " UTC"


def elo_cell(r):
    return f"{r['elo']:.0f} ±{r['err']:.0f}" if r["elo"] is not None else "—"


def cell(text):
    return html.escape(text or "", quote=False).replace("|", "\\|")


def render_ledger(series, main_rows):
    """The shared history: in flight, champion lineage, every result."""
    lines = ["# Ledger", "",
             "Who tried what, on which host, with what result, and where the engine "
             "went. Rebuilt from the git log by `git fetch origin && python "
             "tools/progress.py` (run on main; `--print` shows it without writing). "
             "Don't edit by hand.", "",
             "## In flight", "",
             "Being benched right now. Don't start the same idea on the other branch.", "",
             "| Since | Who | Branch | Trying | Hypothesis |", "|---|---|---|---|---|"]
    flying = [(n, r) for n, rows in series for r in in_flight(rows)]
    for n, r in flying:
        stale = " (stale? no result after 4 h)" if time.time() - r["time"] > 4 * 3600 else ""
        lines.append(f"| {stamp(r['time'])}{stale} | {cell(r['who'])} | `{n}` @`{r['sha']}` "
                     f"| {cell(r['desc'])} | {cell(r.get('hypothesis'))} |")
    if not flying:
        lines.append("| — | | | nothing | |")
    lines += ["", "## Champion engine on main", "",
              "Engine code moves between the branches only through main: a `[keep]` "
              "is `[promote]`d to main, and the other branch adopts it with a `[sync]` "
              "re-benched on its own host. `[ladder]` bumps of `TARGET_ELO` live here too.", "",
              "| When | Who | Event | From | Elo | Host | What |", "|---|---|---|---|---|---|---|"]
    for r in main_rows:
        src = (f"`{r['branch']}@{r['from']}`" if r["status"] == "promote"
               else f"`{r['origin']}`" if r["origin"] else "")
        lines.append(f"| {stamp(r['time'])} | {cell(r['who'])} | {r['status']} `{r['sha']}` "
                     f"| {src} | {elo_cell(r)} | {r['host'] or '?'} | {cell(r['desc'])} |")
    if not main_rows:
        lines.append("| — | | nothing promoted yet: main has the baseline engine | | | | |")
    lines += ["", "## Every result", "",
              "Newest first, both branches. **State**: `in main` = part of the champion "
              "engine; `branch` = kept on its branch only (promote it, or re-try it on the "
              "champion); `dropped` = kept, then replaced by a `[sync]` before it was "
              "promoted (worth re-trying on the champion); `champion` = a `[sync]`, main's engine "
              "re-benched on that host; `reverted` = discarded or crashed.", "",
              "| When | Who | Branch | Host | Result | Elo | W/D/L @target | What was tried | State | Commit |",
              "|---|---|---|---|---|---|---|---|---|---|"]
    rows = sorted(((n, r) for n, rs in series for r in rs if r["status"] != "exp"),
                  key=lambda x: -x[1]["time"])
    for n, r in rows:
        m = RESULT_RE.match(r["subject"])
        wdl = (f"{m['w']}/{m['d']}/{m['l']} @{m['target']} ({m['wins']} wins)"
               if m and m["w"] else f"→ {r['target']}" if r["status"] == "ladder" else "")
        lines.append(f"| {stamp(r['time'])} | {cell(r['who'])} | `{n}` | {r['host'] or '?'} "
                     f"| **{r['status']}** | {elo_cell(r)} | {wdl} | {cell(r['desc'])} "
                     f"| {r['state']} | `{r['sha']}` |")
    if not rows:
        lines.append("| — | | | | | | | nothing yet | | |")
    return "\n".join(lines) + "\n"


def update_readme(table):
    text = README_PATH.read_text(encoding="utf-8")
    block = f"{START}\n{table}\n{END}"
    if START in text and END in text:
        head, rest = text.split(START, 1)
        text = head + block + rest.split(END, 1)[1]
    else:
        text = text.rstrip() + "\n\n## Progress\n\n" + block + "\n"
    README_PATH.write_text(text, encoding="utf-8", newline="\n")


def main():
    series, main_rows = load()
    ledger = render_ledger(series, main_rows)
    if "--print" in sys.argv[1:]:
        sys.stdout.buffer.write(ledger.encode("utf-8"))
        return
    LEDGER_PATH.write_text(ledger, encoding="utf-8", newline="\n")
    SVG_PATH.write_text(render_svg(series), encoding="utf-8", newline="\n")
    stats = [summarize(name, rows, main_rows) for name, rows in series]
    update_readme(render_table(stats, main_rows))
    for s in stats:
        best = f"{s['best']['elo']:.0f}" if s["best"] else "—"
        print(f"{s['name']} ({s['who']}): {s['runs']} experiments, {s['keeps']} kept, "
              f"best elo {best}")
    print(f"wrote {LEDGER_PATH.name}, {SVG_PATH.name} and the README scoreboard")


if __name__ == "__main__":
    main()
