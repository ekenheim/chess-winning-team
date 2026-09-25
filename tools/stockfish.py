"""Pinned Stockfish opponent: download it, and locate it.

Both machines (macOS and Windows) must play the exact same Stockfish build,
otherwise UCI_Elo levels are not the same opponent and results from the two
branches cannot be compared. The binary is never committed (~80 MB per OS,
GPL-3); it is fetched into tools/stockfish/ (gitignored) by:

    python tools/stockfish.py

The arena resolves the binary with find_stockfish(): STOCKFISH_PATH env var,
then tools/stockfish/, then PATH. Whichever it finds must report the pinned
version, or it refuses to run.
"""

import hashlib
import os
import platform
import shutil
import subprocess
import sys
import tarfile
import urllib.request
import zipfile
from pathlib import Path

STOCKFISH_VERSION = "19"
RELEASE_TAG = "sf_19"

# Official release assets, sha256 from the GitHub release metadata.
ASSETS = {
    ("darwin", "arm64"): ("stockfish-macos-universal.tar.gz",
                          "a1f0e3bcc5a6927a11fe6fc8e54a779754645f3c2bae2cf13420fd1957adaa77"),
    ("darwin", "x86_64"): ("stockfish-macos-universal.tar.gz",
                           "a1f0e3bcc5a6927a11fe6fc8e54a779754645f3c2bae2cf13420fd1957adaa77"),
    ("windows", "amd64"): ("stockfish-windows-x86-64-universal.zip",
                           "3c8bf1f9ea66a09350a40df4f632288285ac206d99f33ab5842c408fc30b48a7"),
    ("windows", "arm64"): ("stockfish-windows-arm64-universal.zip",
                           "8372ad3f0d7276deb2c70f801f541ec7db463219fc6d9c7592864e542aa4f401"),
    ("linux", "x86_64"): ("stockfish-linux-x86-64-universal.tar.gz",
                          "9defc0d4e55d49c65a6d042f3e571a39fcea499ade6dbe741b53b8c65e03611f"),
    ("linux", "aarch64"): ("stockfish-linux-arm64-universal.tar.gz",
                           "fe26cfd1d9db4c8af3d21e24d9ff34cacb31c1f940085a7583da11796f2bac01"),
}

INSTALL_DIR = Path(__file__).resolve().parent / "stockfish"
EXE_NAME = "stockfish.exe" if os.name == "nt" else "stockfish"


def _platform_key():
    return platform.system().lower(), platform.machine().lower()


def binary_version(path):
    """Return the version string Stockfish prints on startup, e.g. '19'."""
    out = subprocess.run([str(path)], input="quit\n", capture_output=True,
                         text=True, timeout=10).stdout
    first = out.splitlines()[0] if out else ""
    parts = first.split()
    return parts[1] if len(parts) > 1 and parts[0] == "Stockfish" else first


def find_stockfish():
    """Locate the pinned Stockfish binary or raise with setup instructions."""
    candidates = [os.environ.get("STOCKFISH_PATH"), INSTALL_DIR / EXE_NAME,
                  shutil.which("stockfish")]
    for c in candidates:
        if c and Path(c).is_file():
            version = binary_version(c)
            if version != STOCKFISH_VERSION:
                raise RuntimeError(
                    f"{c} is Stockfish {version!r}, pinned version is "
                    f"{STOCKFISH_VERSION}. Run: python tools/stockfish.py")
            return str(c)
    raise RuntimeError("Stockfish not found. Run: python tools/stockfish.py")


def install():
    key = _platform_key()
    if key not in ASSETS:
        sys.exit(f"No pinned Stockfish asset for {key}; add one to ASSETS.")
    name, sha256 = ASSETS[key]
    target = INSTALL_DIR / EXE_NAME
    if target.is_file() and binary_version(target) == STOCKFISH_VERSION:
        print(f"Stockfish {STOCKFISH_VERSION} already installed: {target}")
        return

    INSTALL_DIR.mkdir(parents=True, exist_ok=True)
    archive = INSTALL_DIR / name
    url = (f"https://github.com/official-stockfish/Stockfish/releases/"
           f"download/{RELEASE_TAG}/{name}")
    print(f"Downloading {url}")
    urllib.request.urlretrieve(url, archive)

    digest = hashlib.sha256(archive.read_bytes()).hexdigest()
    if digest != sha256:
        archive.unlink()
        sys.exit(f"Checksum mismatch for {name}: got {digest}")

    # The engine binary is stockfish/stockfish-<os>-<arch>[.exe] in the archive.
    if name.endswith(".zip"):
        with zipfile.ZipFile(archive) as z:
            member = next(m for m in z.namelist()
                          if Path(m).name.startswith("stockfish-")
                          and Path(m).suffix in ("", ".exe"))
            target.write_bytes(z.read(member))
    else:
        with tarfile.open(archive) as t:
            member = next(m for m in t.getmembers()
                          if m.isfile() and Path(m.name).name.startswith("stockfish-")
                          and Path(m.name).suffix == "")
            target.write_bytes(t.extractfile(member).read())
    target.chmod(0o755)
    archive.unlink()

    version = binary_version(target)
    if version != STOCKFISH_VERSION:
        sys.exit(f"Installed binary reports version {version!r}")
    print(f"Installed Stockfish {version}: {target}")


if __name__ == "__main__":
    install()
