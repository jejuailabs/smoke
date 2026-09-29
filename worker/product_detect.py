"""Read-only ZIP intake metadata inside an isolated worker.

Never install or execute archive contents here. This module still decompresses
untrusted data and must not run in the web process.
"""

from __future__ import annotations

import hashlib
import json
import sys
import zipfile
from dataclasses import asdict, dataclass
from pathlib import Path

from archive_scan import ArchiveRejected, ArchiveSummary, inspect_archive

MAX_MANIFEST_BYTES = 256 * 1024


@dataclass(frozen=True)
class ProductIntake:
    checksum_sha256: str
    archive_bytes: int
    file_count: int
    expanded_bytes: int
    entry_root: str
    runtime: str
    install_command: str | None
    build_command: str | None
    start_command: str | None
    needs_review: bool
    warnings: tuple[str, ...]


def _entry_root(summary: ArchiveSummary) -> str:
    paths = [path for path in summary.paths if not path.startswith("__MACOSX/") and path != ".DS_Store"]
    if not paths:
        return ""
    first = paths[0].split("/", 1)[0]
    return first + "/" if all(path.startswith(first + "/") for path in paths) else ""


def inspect_product(archive_path: Path) -> ProductIntake:
    summary = inspect_archive(archive_path)
    root = _entry_root(summary)
    entries = set(summary.paths)
    checksum = hashlib.sha256()
    with archive_path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            checksum.update(chunk)

    runtime = "unsupported"
    install = build = start = None
    warnings: list[str] = []
    if root + "index.html" in entries:
        runtime = "static"
        if root + "package.json" in entries:
            warnings.append("both_static_and_node_detected")
    elif root + "package.json" in entries:
        with zipfile.ZipFile(archive_path) as archive:
            manifest_info = archive.getinfo(root + "package.json")
            if manifest_info.file_size > MAX_MANIFEST_BYTES:
                raise ArchiveRejected("invalid_package_manifest")
            try:
                with archive.open(manifest_info) as source:
                    manifest = json.loads(source.read(MAX_MANIFEST_BYTES + 1).decode("utf-8"))
            except (UnicodeError, json.JSONDecodeError, zipfile.BadZipFile) as exc:
                raise ArchiveRejected("invalid_package_manifest") from exc
        if not isinstance(manifest, dict) or not isinstance(manifest.get("scripts", {}), dict):
            raise ArchiveRejected("invalid_package_manifest")
        scripts = manifest.get("scripts", {})
        runtime = "node"
        install = "npm ci" if root + "package-lock.json" in entries else "npm install"
        if install == "npm install":
            warnings.append("missing_npm_lockfile")
        if isinstance(scripts.get("build"), str) and scripts["build"].strip():
            build = "npm run build"
        if isinstance(scripts.get("start"), str) and scripts["start"].strip():
            start = "npm run start"
        elif isinstance(scripts.get("dev"), str) and scripts["dev"].strip():
            start = "npm run dev"
            warnings.append("dev_server_only")
        else:
            warnings.append("missing_start_script")
    else:
        warnings.append("unsupported_runtime")

    return ProductIntake(
        checksum.hexdigest(), archive_path.stat().st_size, summary.file_count,
        summary.expanded_bytes, root, runtime, install, build, start,
        runtime != "static" or bool(warnings), tuple(warnings),
    )


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("usage: product_detect.py archive.zip")
    try:
        print(json.dumps(asdict(inspect_product(Path(sys.argv[1])))))
    except ArchiveRejected as exc:
        print(json.dumps({"errorCode": str(exc)}))
        raise SystemExit(2)
