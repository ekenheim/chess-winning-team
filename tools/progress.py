"""Elo-over-time chart and scoreboard, rebuilt from the git log.

The git history is the experiment log (see program.md), so this reads every
`autoresearch/*` branch (local and on origin), parses the result line of each
experiment commit, and writes:

    progress.svg   one dot per experiment, kept ones labelled, running best
    README.md      the scoreboard between the progress:start/end markers

    python tools/progress.py

Standard library only, so it runs on both machines with no installs. Run it
after the result message is final and fold the output into the same commit:

    python tools/progress.py && git add progress.svg README.md \
        && git commit --amend --no-edit
"""

import html
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SVG_PATH = ROOT / "progress.svg"
README_PATH = ROOT / "README.md"
START, END = "<!-- progress:start -->", "<!-- progress:end -->"

RESULT_RE = re.compile(
    r"^\[(?P<status>keep|discard|crash|FULL)\]\s+"
    r"(?:elo=(?P<elo>-?[\d.]+)±(?P<err>[\d.]+)\s+"
    r"W/D/L=(?P<w>\d+)/(?P<d>\d+)/(?P<l>\d+)\s+"
    r"@(?P<target>\d+)\s+wins@target=(?P<wins>\d+)\s+)?"
    r"(?:—|-{1,2})\s*(?P<desc>.*)$")
LADDER_RE = re.compile(r"^\[ladder\]\s+TARGET_ELO\s+\d+\s*(?:->|→)\s*(\d+)\s*"
                       r"(?:—|-{1,2})?\s*(?P<desc>.*)$")
HOST_RE = re.compile(r"^host:\s*([^\s,(]+)", re.MULTILINE)

COLORS = ["#2a78d6", "#d9622b", "#1f9e6e", "#9b4dca"]
GREY = "#c4c7cc"
INK, MUTED, GRID = "#1d1f23", "#6b7078", "#e6e8eb"


def git(*args):
    return subprocess.run(["git", *args], cwd=ROOT, capture_output=True,
                          encoding="utf-8", check=True).stdout


def branches():
    """Map run name -> ref, preferring the local branch over origin's copy."""
    refs = git("for-each-ref", "--format=%(refname)",
               "refs/heads/autoresearch/", "refs/remotes/origin/autoresearch/")
    found = {}
    for ref in refs.split():
        name = ref.split("autoresearch/", 1)[1]
        if ref.startswith("refs/heads/") or name not in found:
            found[name] = ref
    return found


def experiments(ref):
    """Result commits on a branch that are not on main, oldest first."""
    out = git("log", "--reverse", "--format=%H%x1f%ct%x1f%B%x1e", f"main..{ref}")
    rows = []
    for entry in out.split("\x1e"):
        if not entry.strip():
            continue
        sha, ts, body = entry.strip().split("\x1f", 2)
        subject = body.splitlines()[0]
        host = HOST_RE.search(body)
        host = host[1] if host else None
        ladder = LADDER_RE.match(subject)
        if ladder:
            rows.append({"sha": sha[:7], "time": int(ts), "status": "ladder",
                         "desc": ladder["desc"].strip(), "host": host,
                         "elo": None, "err": None, "wins": 0,
                         "target": int(ladder[1])})
            continue
        m = RESULT_RE.match(subject)
        if not m:
            continue
        row = {"sha": sha[:7], "time": int(ts), "status": m["status"],
               "desc": m["desc"].strip(), "host": host,
               "elo": float(m["elo"]) if m["elo"] else None,
               "err": float(m["err"]) if m["err"] else None,
               "target": int(m["target"]) if m["target"] else None,
               "wins": int(m["wins"]) if m["wins"] else 0}
        rows.append(row)
    return rows


def summarize(name, rows):
    runs = [r for r in rows if r["status"] in ("keep", "discard", "crash")]
    keeps = [r for r in rows if r["status"] == "keep"]
    fulls = [r for r in rows if r["status"] == "FULL"]
    targets = [r["target"] for r in rows if r["target"]]
    best = max(keeps, key=lambda r: r["elo"], default=None)
    best_full = max(fulls, key=lambda r: r["elo"], default=None)
    hosts = [r["host"] for r in rows if r["host"]]
    return {"name": name, "host": hosts[-1] if hosts else "?",
            "runs": len(runs), "keeps": len(keeps),
            "best": best, "best_full": best_full,
            "target": targets[-1] if targets else None,
            "wins": max((r["wins"] for r in fulls), default=0),
            "proofs": sum(r["status"] == "ladder" for r in rows)}


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
    n_max = max((sum(r["status"] in ("keep", "discard", "crash") for r in rows)
                 for _, rows in series), default=0)
    total = sum(sum(r["status"] in ("keep", "discard", "crash") for r in rows)
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
            if r["status"] in ("keep", "discard", "crash"):
                i += 1
            if r["status"] == "crash" or r["elo"] is None:
                continue
            x, y = X(max(i, 1)), Y(r["elo"])
            if r["status"] == "discard":
                out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="3.5" '
                           f'fill="{GREY}"/>')
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


def render_table(stats):
    lines = ["![Elo progress](progress.svg)", "",
             "| Run | Host | Experiments | Kept | Best Elo (0.25 s) | "
             "Best FULL Elo (5 s) | Target | Wins@target (FULL) | Proofs |",
             "|---|---|---|---|---|---|---|---|---|"]
    if not stats:
        lines.append("| — | — | 0 | 0 | — | — | — | — | — |")
    for s in stats:
        best = (f"**{s['best']['elo']:.0f}** ±{s['best']['err']:.0f} "
                f"({s['best']['desc']})" if s["best"] else "—")
        full = (f"{s['best_full']['elo']:.0f} ±{s['best_full']['err']:.0f}"
                if s["best_full"] else "—")
        lines.append(f"| `{s['name']}` | {s['host']} | {s['runs']} | {s['keeps']} "
                     f"| {best} | {full} | {s['target'] or '—'} | {s['wins']} "
                     f"| {s['proofs']} |")
    lines += ["", "Elo is only comparable within one host (the Mac and the "
              "Windows PC reach different depths). Rebuilt from the git log by "
              "`python tools/progress.py`."]
    return "\n".join(lines)


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
    series = [(name, experiments(ref)) for name, ref in sorted(branches().items())]
    series = [(name, rows) for name, rows in series if rows]
    SVG_PATH.write_text(render_svg(series), encoding="utf-8", newline="\n")
    stats = [summarize(name, rows) for name, rows in series]
    update_readme(render_table(stats))
    for s in stats:
        best = f"{s['best']['elo']:.0f}" if s["best"] else "—"
        print(f"{s['name']}: {s['runs']} experiments, {s['keeps']} kept, "
              f"best elo {best}")
    print(f"wrote {SVG_PATH.name} and the README scoreboard")


if __name__ == "__main__":
    main()
