"""Inspect and extract a product ZIP inside an isolated, unprivileged worker.

This module is not a sandbox. Call it only after the archive has been placed in
an isolated worker with CPU, disk, network, and time limits.
"""

from __future__ import annotations

import json
import stat
import sys
import zipfile
from dataclasses import dataclass
from pathlib import Path, PurePosixPath


MAX_ARCHIVE_BYTES = 100 * 1024 * 1024
MAX_EXPANDED_BYTES = 500 * 1024 * 1024
MAX_FILES = 20_000
COPY_CHUNK_BYTES = 1024 * 1024
NESTED_ARCHIVE_SUFFIXES = {".zip", ".tar", ".gz", ".tgz", ".7z", ".rar"}


class ArchiveRejected(ValueError):
    pass


@dataclass(frozen=True)
class ArchiveSummary:
    file_count: int
    expanded_bytes: int
    paths: tuple[str, ...]


def _safe_name(info: zipfile.ZipInfo) -> str:
    name = info.filename.replace("\\", "/")
    segments = name.rstrip("/").split("/")
    if not name or len(name) > 1024 or name.startswith("/") or any(part in ("", ".", "..") or ":" in part for part in segments):
        raise ArchiveRejected("invalid_archive_path")
    return str(PurePosixPath(name))


def inspect_archive(archive_path: Path) -> ArchiveSummary:
    if not archive_path.is_file() or archive_path.stat().st_size > MAX_ARCHIVE_BYTES:
        raise ArchiveRejected("archive_limit_exceeded")
    seen: set[str] = set()
    files: set[str] = set()
    directories: set[str] = set()
    paths: list[str] = []
    expanded = 0
    count = 0
    try:
        with zipfile.ZipFile(archive_path) as archive:
            if len(archive.infolist()) > MAX_FILES:
                raise ArchiveRejected("archive_limit_exceeded")
            for info in archive.infolist():
                name = _safe_name(info)
                key = name.casefold()
                if key in seen:
                    raise ArchiveRejected("duplicate_archive_path")
                seen.add(key)
                parts = key.split("/")
                ancestors = {"/".join(parts[:index]) for index in range(1, len(parts))}
                if ancestors & files or (not info.is_dir() and key in directories):
                    raise ArchiveRejected("archive_path_conflict")
                directories.update(ancestors)
                mode = info.external_attr >> 16
                kind = stat.S_IFMT(mode)
                if kind not in (0, stat.S_IFREG, stat.S_IFDIR):
                    raise ArchiveRejected("unsupported_archive_entry")
                if info.flag_bits & 0x1:
                    raise ArchiveRejected("encrypted_archive")
                if info.compress_type not in (zipfile.ZIP_STORED, zipfile.ZIP_DEFLATED):
                    raise ArchiveRejected("unsupported_compression")
                if info.is_dir():
                    if key in files:
                        raise ArchiveRejected("archive_path_conflict")
                    directories.add(key)
                    continue
                if PurePosixPath(name).suffix.lower() in NESTED_ARCHIVE_SUFFIXES:
                    raise ArchiveRejected("nested_archive")
                count += 1
                files.add(key)
                expanded += info.file_size
                if count > MAX_FILES or expanded > MAX_EXPANDED_BYTES:
                    raise ArchiveRejected("archive_limit_exceeded")
                paths.append(name)
    except (zipfile.BadZipFile, zipfile.LargeZipFile, OSError) as exc:
        raise ArchiveRejected("invalid_archive") from exc
    if count == 0:
        raise ArchiveRejected("empty_archive")
    return ArchiveSummary(count, expanded, tuple(paths))


def extract_archive(archive_path: Path, destination: Path) -> ArchiveSummary:
    """Extract after inspection; enforce byte limits again while streaming."""
    summary = inspect_archive(archive_path)
    destination.mkdir(parents=True, exist_ok=False)
    root = destination.resolve()
    written = 0
    try:
        with zipfile.ZipFile(archive_path) as archive:
            for info in archive.infolist():
                name = _safe_name(info)
                target = (root / name).resolve()
                if not target.is_relative_to(root):
                    raise ArchiveRejected("invalid_archive_path")
                if info.is_dir():
                    target.mkdir(parents=True, exist_ok=True)
                    continue
                target.parent.mkdir(parents=True, exist_ok=True)
                if target.exists():
                    raise ArchiveRejected("duplicate_archive_path")
                with archive.open(info) as source, target.open("xb") as output:
                    while chunk := source.read(COPY_CHUNK_BYTES):
                        written += len(chunk)
                        if written > MAX_EXPANDED_BYTES:
                            raise ArchiveRejected("archive_limit_exceeded")
                        output.write(chunk)
                if target.stat().st_size != info.file_size:
                    raise ArchiveRejected("archive_size_mismatch")
    except (zipfile.BadZipFile, OSError) as exc:
        # The caller owns the disposable worker volume and must destroy it on failure.
        raise ArchiveRejected("invalid_archive") from exc
    except Exception:
        # The caller owns the disposable worker volume and must destroy it on failure.
        raise
    return summary


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("usage: archive_scan.py archive.zip")
    try:
        result = inspect_archive(Path(sys.argv[1]))
        print(json.dumps({"fileCount": result.file_count, "expandedBytes": result.expanded_bytes, "paths": result.paths}))
    except ArchiveRejected as exc:
        print(json.dumps({"errorCode": str(exc)}))
        raise SystemExit(2)
