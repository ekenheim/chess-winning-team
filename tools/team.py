"""The two-person side of the loop: move engine code between the branches
through main, and keep the shared ledger on main up to date.

Engine code never moves branch -> branch. A kept result is promoted to main
(the champion engine), and the other branch adopts it with a sync that is
re-benched on its own host (Elo is only comparable within one host).

    python tools/team.py sync              # loop step 1, in your branch worktree
    python tools/team.py promote <sha>     # a pushed [keep] (or [FULL]) result -> main's engine
    python tools/team.py publish           # rebuild LEDGER/scoreboard/evidence on main
    python tools/team.py ladder <sha>:<pgn> [<sha>:<pgn> ...]
                                           # 5 s wins -> proofs on main, tagged, and
                                           # TARGET_ELO = highest level beaten + LADDER_STEP

Actions on main run in a detached worktree next to the original checkout
(`../chess-main`, or $TEAM_MAIN_WORKTREE) that only this script uses: each
attempt resets it to origin/main, applies the change and pushes, and retries
when the other machine pushed first. Needs python-chess (publish runs
evidence.py). Run from Git Bash on Windows like the rest of the loop.
"""

import os
import re
import subprocess
import sys
from pathlib import Path

HERE = Path(subprocess.run(["git", "rev-parse", "--show-toplevel"], capture_output=True,
                           encoding="utf-8").stdout.strip() or ".")
HOST_RE = re.compile(r"^host:\s*([\w.-]+)", re.M)
KEEP_RE = re.compile(r"^\[(?:keep|FULL)\]\s+elo=(?P<elo>-?[\d.]+)±(?P<err>[\d.]+)\s+"
                     r"W/D/L=\S+\s+@(?P<target>\d+)\s+wins@target=\d+\s+"
                     r"(?:—|-{1,2})\s*(?P<desc>.*)$")
TARGET_RE = re.compile(r"^TARGET_ELO = (\d+)", re.M)
STEP_RE = re.compile(r"^LADDER_STEP = (\d+)", re.M)
# Paths main decides for everyone: the champion engine and the ladder.
CHAMPION_PATHS = ["engine", "arena"]
# Written only on main; a branch always takes main's copy.
GENERATED = ["README.md", "progress.svg", "LEDGER.md"]
# Records a branch adds and main may lack: a merge must never delete them.
RECORDS = ["games", "analysis"]
# What a promote copies from the result besides engine/ (never games/proofs:
# proofs reach main only through a verified [ladder]).
PROMOTED = ["games/runs", "games/gauntlet", "analysis"]


def run(*args, cwd=None):
    return subprocess.run(["git", *args], cwd=cwd or HERE, capture_output=True,
                          encoding="utf-8")


def git(*args, cwd=None, check=True):
    r = run(*args, cwd=cwd)
    if check and r.returncode:
        sys.exit(f"git {' '.join(args)} failed:\n{r.stdout}{r.stderr}")
    return r.stdout.strip()


def ok(*args, cwd=None):
    return run(*args, cwd=cwd).returncode == 0


def die(msg):
    sys.exit(f"team.py: {msg}")


def last_change(*paths, ref="origin/main", cwd=None):
    """The last commit on main's own line that changed `paths`."""
    return git("log", "--first-parent", "-1", "--format=%H", ref, "--", *paths, cwd=cwd)


def built_on(engine_ref, ref, cwd=None):
    """True if main's engine at `engine_ref` is the engine/ of some commit on
    `ref`'s first-parent line: `ref` was developed (and benched) on top of it.
    Compares content, so a promote's merge commit need not be an ancestor."""
    want = git("rev-parse", f"{engine_ref}:engine", cwd=cwd)
    commits = git("rev-list", "--first-parent", "-n", "2000", ref, cwd=cwd).split()
    r = subprocess.run(["git", "cat-file", "--batch-check=%(objectname)"], cwd=cwd or HERE,
                       input="".join(f"{c}:engine\n" for c in commits),
                       capture_output=True, encoding="utf-8")
    return want in r.stdout.split()


def owner(sha):
    """The branch whose own (first-parent) line holds `sha`."""
    for ref in git("for-each-ref", "--format=%(refname:short)",
                   "refs/remotes/origin/autoresearch/").split():
        if sha in git("rev-list", "--first-parent", ref).split():
            return ref.split("autoresearch/", 1)[1]
    return None


def main_worktree():
    """A detached worktree of origin/main used only by this script."""
    path = os.environ.get("TEAM_MAIN_WORKTREE")
    if not path:
        common = Path(git("rev-parse", "--path-format=absolute", "--git-common-dir"))
        path = common.parent.parent / "chess-main"
    path = Path(path)
    if not (path / ".git").exists():
        git("worktree", "add", "--detach", str(path), "origin/main")
        print(f"created the main worktree {path}")
    return path


def on_main(action, what):
    """Run `action(worktree)` on a fresh origin/main and push; retry on a race.
    `action` returns False when there is nothing to commit."""
    wt = main_worktree()
    for _ in range(4):
        git("fetch", "-q", "origin", cwd=wt)
        git("reset", "-q", "--hard", "origin/main", cwd=wt)
        git("clean", "-qfd", "--", "evidence", cwd=wt)
        if action(wt) is False:
            print(f"{what}: nothing to change on main")
            return False
        push = run("push", "-q", "origin", "HEAD:main", cwd=wt)
        if push.returncode == 0:
            print(f"{what}: pushed to main as {git('rev-parse', '--short', 'HEAD', cwd=wt)}")
            return True
        if "rejected" not in push.stderr and "fetch first" not in push.stderr:
            die(f"{what}: push failed:\n{push.stderr}")
        print(f"{what}: main moved (the other machine pushed), retrying")
    die(f"{what}: could not push to main after 4 attempts")


def cmd_sync(_args):
    if git("status", "--porcelain", "--untracked-files=no"):
        die("commit or stash your changes first (sync runs between experiments)")
    if git("ls-files", "--others", "--exclude-standard", "--", "engine"):
        die("untracked files under engine/: commit, ignore or remove them first")
    head = git("log", "-1", "--format=%s")
    if head.startswith("[exp]") and git("diff", "--name-only", "HEAD~1", "HEAD"):
        die("HEAD is an [exp] with no result yet: log its result first (step 7)")
    before = git("rev-parse", "HEAD")
    git("fetch", "-q", "origin")
    if ok("merge-base", "--is-ancestor", "origin/main", "HEAD"):
        print("sync: up to date with main")
        return
    champ = last_change(*CHAMPION_PATHS)
    behind = bool(champ) and not ok("merge-base", "--is-ancestor", champ, "HEAD")
    # Main's engine is one this branch already built on (e.g. it promoted the
    # engine this branch started from): only the arena may need adopting.
    engine_known = built_on("origin/main", "HEAD")
    merge = run("merge", "--no-ff", "--no-commit", "origin/main")
    if merge.returncode and not ok("rev-parse", "-q", "--verify", "MERGE_HEAD"):
        die(f"git merge origin/main did not start:\n{merge.stdout}{merge.stderr}")
    # Main never deletes a branch's games or analysis: restore any the merge dropped
    # (a promote copies the promoted result's records, but older ones may be missing).
    gone = git("diff", "--cached", "--name-only", "--diff-filter=D", before, "--",
               *RECORDS).splitlines()
    if gone:
        git("checkout", before, "--", *gone)
    if behind and engine_known:
        git("checkout", before, "--", "engine")
        git("checkout", "origin/main", "--", "arena")
    elif behind:
        # Main has a new champion engine or a new ladder: take main's engine and
        # arena wholesale, dropping engine files only this branch had.
        tracked = set(git("ls-tree", "-r", "--name-only", before, "--", "engine").splitlines())
        git("rm", "-rq", "--cached", "--ignore-unmatch", "--", "engine")
        git("checkout", "origin/main", "--", *CHAMPION_PATHS)
        for f in git("ls-files", "--others", "--exclude-standard", "--", "engine").splitlines():
            if f in tracked:
                (HERE / f).unlink()
    # Generated files and proofs are main's, whether or not they conflicted.
    ours = [p for p in GENERATED + ["games/proofs"] if ok("cat-file", "-e", f"origin/main:{p}")]
    if ours:
        git("checkout", "origin/main", "--", *ours)
    left = git("diff", "--name-only", "--diff-filter=U").splitlines()
    if left:
        git("merge", "--abort", check=False)
        die("merging origin/main conflicts in " + ", ".join(left)
            + ": only main may change these. Revert your branch's edit to them "
            "(or take main's copy) and commit, then re-run `team.py sync`. "
            "Do not `git merge origin/main` by hand: sync decides whether to re-bench.")
    adopt = behind and not ok("diff", "--cached", "--quiet", before, "--", *CHAMPION_PATHS)
    main_sha = git("rev-parse", "--short", "origin/main")
    git("commit", "-q", "--no-verify", "-m",
        f"Merge origin/main: adopt the champion engine main@{main_sha}" if adopt
        else f"Merge origin/main@{main_sha}")
    git("push", "-q")
    changed = git("diff", "--name-only", before, "HEAD").splitlines()
    if "program.md" in changed:
        print("sync: program.md changed on main: RE-READ IT before continuing")
    if adopt:
        parts = [p for p in CHAMPION_PATHS if any(f.startswith(p + "/") for f in changed)]
        print(f"sync: ADOPTED main@{main_sha} ({' + '.join(parts)} changed). Now `make bench` "
              f"and log the result as [sync] (not keep/discard): it is your new best_elo "
              f"on this host.")
    else:
        print(f"sync: merged main@{main_sha} (no engine change, no bench needed)")


def cmd_promote(args):
    if len(args) != 1:
        die("usage: team.py promote <keep-sha>")
    git("fetch", "-q", "origin")
    sha = git("rev-parse", "--verify", f"{args[0]}^{{commit}}")
    body = git("show", "-s", "--format=%B", sha)
    m, host = KEEP_RE.match(body.splitlines()[0]), HOST_RE.search(body)
    if not m:
        die(f"{sha[:7]} is not a [keep] or [FULL] result line: {body.splitlines()[0]}")
    if body.startswith("[FULL]"):
        # A [FULL] may sit on a later tip than the engine it confirmed: only
        # promote it when its tree's engine is exactly the `engine:` it names.
        eng = re.search(r"^engine:\s*([0-9a-f]{7,40})", body, re.M)
        if not eng or git("diff", eng[1], sha, "--", "engine"):
            die(f"{sha[:7]}: a [FULL] needs an `engine: <sha>` line equal to its own engine/")
    if not host:
        die(f"{sha[:7]}: its body needs a `host:` line")
    branch = owner(sha)
    if not branch:
        die(f"{sha[:7]} is not on any pushed origin/autoresearch/* branch: push it first")

    def action(wt):
        same = not git("diff", "HEAD", sha, "--", "engine", cwd=wt)
        if same and git("log", "--first-parent", "-1", "--format=%H",
                        f"--grep=^from: {branch}@{sha}$", "HEAD", cwd=wt):
            return False  # already promoted
        # Only the engine matters here: a [ladder] since then doesn't make it stale.
        # (A result whose engine main already has, e.g. merged by hand, is just recorded.)
        champ = last_change("engine", ref="HEAD", cwd=wt)
        if not same and champ and not (ok("merge-base", "--is-ancestor", champ, sha, cwd=wt)
                                       or built_on("HEAD", sha, cwd=wt)):
            die(f"{sha[:7]} was not benched on the current champion "
                f"({champ[:7]}): run `team.py sync`, bench, and re-apply the idea")
        # A merge edge (so the promoter's next sync is clean) that takes only
        # the result's engine/ plus its run records, never its other files.
        if not ok("merge-base", "--is-ancestor", sha, "HEAD", cwd=wt):
            git("merge", "-q", "--no-ff", "--no-commit", "-s", "ours", sha, cwd=wt)
        git("rm", "-rq", "--", "engine", cwd=wt)
        records = [p for p in ["engine"] + PROMOTED if ok("cat-file", "-e", f"{sha}:{p}", cwd=wt)]
        git("checkout", sha, "--", *records, cwd=wt)
        git("commit", "-q", "--no-verify", "--allow-empty",
            "-m", f"[promote] {branch}@{sha[:7]} elo={float(m['elo']):.0f}±{float(m['err']):.0f} "
                  f"@{m['target']} host={host[1]} — {m['desc'].strip()}",
            "-m", f"from: {branch}@{sha}\nhost: {host[1]}", cwd=wt)

    on_main(action, f"promote {branch}@{sha[:7]}")
    cmd_publish([])


def cmd_publish(_args):
    def action(wt):
        for tool in ("progress.py", "evidence.py"):
            r = subprocess.run([sys.executable, f"tools/{tool}"], cwd=wt,
                               capture_output=True, encoding="utf-8")
            print(r.stdout.rstrip())
            if r.returncode and (tool == "progress.py" or "Traceback" in r.stderr):
                die(f"{tool} failed:\n{r.stderr}")
            if r.returncode:
                print(f"publish: {tool} reported problems (see above); fix the record")
        git("add", "-A", "--", "README.md", "progress.svg", "LEDGER.md", "evidence", cwd=wt)
        if not git("diff", "--cached", "--name-only", cwd=wt):
            return False
        git("commit", "-q", "--no-verify", "-m", "Ledger: rebuild from the log", cwd=wt)

    on_main(action, "publish")


def cmd_ladder(args):
    if not args:
        die("usage: team.py ladder <sha>:<pgn-path> [<sha>:<pgn-path> ...]")
    git("fetch", "-q", "origin")
    proofs = []
    for spec in args:
        sha, _, path = spec.partition(":")
        sha = git("rev-parse", "--verify", f"{sha}^{{commit}}")
        blob = subprocess.run(["git", "show", f"{sha}:{path}"], cwd=HERE,
                              capture_output=True, check=True).stdout  # bytes, unchanged
        text = blob.decode("utf-8")
        head = {k: v for k, v in re.findall(r'^\[(\w+) "([^"]*)"\]', text, re.M)}
        if not all(k in head for k in ("StockfishElo", "Result", "EngineColor", "MoveTimeS")):
            die(f"{spec}: needs StockfishElo, Result, EngineColor and MoveTimeS headers")
        if head["Result"] != {"white": "1-0", "black": "0-1"}.get(head["EngineColor"]):
            die(f"{spec}: not a win for our engine ({head['Result']} as {head['EngineColor']})")
        if float(head["MoveTimeS"]) != 5.0:
            die(f"{spec}: played at {head['MoveTimeS']} s/move; only 5 s/move wins count")
        host = HOST_RE.search(git("show", "-s", "--format=%B", sha))
        proofs.append((int(head["StockfishElo"]), sha, blob, host[1] if host else "?"))
    branch = owner(proofs[0][1]) or "?"
    tags = [f"beat-{lvl}" for lvl, *_ in proofs]

    def action(wt):
        util = wt / "arena" / "util.py"
        text = util.read_text(encoding="utf-8")
        old = int(TARGET_RE.search(text)[1])
        # A win at any ladder level proves that level: one full run can climb two rungs.
        new = max(lvl for lvl, *_ in proofs) + int(STEP_RE.search(text)[1])
        if new <= old:
            die(f"TARGET_ELO on main is already {old}: these proofs don't raise it")
        util.write_text(TARGET_RE.sub(f"TARGET_ELO = {new}", text, count=1),
                        encoding="utf-8", newline="\n")
        files = []
        for lvl, _sha, blob, _host in proofs:
            dest = wt / "games" / "proofs" / f"beat-{lvl}.pgn"
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(blob)
            files.append(dest.relative_to(wt).as_posix())
        git("add", "--", "arena/util.py", *files, cwd=wt)
        git("commit", "-q", "--no-verify",
            "-m", f"[ladder] TARGET_ELO {old} -> {new} — proof {' + '.join(files)}",
            "-m", f"from: {branch}@{proofs[0][1]}\nhost: {proofs[0][3]}", cwd=wt)

    if on_main(action, "ladder"):
        wt = main_worktree()
        for tag in tags:
            remote = git("ls-remote", "--tags", "origin", f"refs/tags/{tag}", cwd=wt)
            if remote:
                print(f"ladder: tag {tag} already on origin at {remote.split()[0][:7]}: left as it is")
                continue
            git("tag", tag, cwd=wt)
            git("push", "-q", "origin", f"refs/tags/{tag}", cwd=wt)
            print(f"ladder: tagged {tag}")
        cmd_publish([])


COMMANDS = {"sync": cmd_sync, "promote": cmd_promote, "publish": cmd_publish,
            "ladder": cmd_ladder}

if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] not in COMMANDS:
        sys.exit(__doc__)
    COMMANDS[sys.argv[1]](sys.argv[2:])
