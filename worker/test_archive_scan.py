import stat
import tempfile
import unittest
import zipfile
from pathlib import Path
from unittest.mock import patch

from archive_scan import ArchiveRejected, extract_archive, inspect_archive


class ArchiveScanTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.base = Path(self.temp.name)
        self.archive = self.base / "product.zip"

    def write_zip(self, entries):
        with zipfile.ZipFile(self.archive, "w") as output:
            for name, content in entries:
                output.writestr(name, content)

    def test_valid_product_extracts(self):
        self.write_zip([("index.html", "<h1>Demo</h1>"), ("assets/app.js", "console.log(1)")])
        summary = inspect_archive(self.archive)
        self.assertEqual(summary.file_count, 2)
        destination = self.base / "out"
        extract_archive(self.archive, destination)
        self.assertEqual((destination / "index.html").read_text(), "<h1>Demo</h1>")

    def test_path_traversal_is_rejected(self):
        self.write_zip([("../escape.txt", "bad")])
        with self.assertRaisesRegex(ArchiveRejected, "invalid_archive_path"):
            inspect_archive(self.archive)

    def test_windows_path_traversal_is_rejected(self):
        self.write_zip([("..\\escape.txt", "bad")])
        with self.assertRaisesRegex(ArchiveRejected, "invalid_archive_path"):
            inspect_archive(self.archive)

    def test_symlink_is_rejected(self):
        link = zipfile.ZipInfo("link")
        link.create_system = 3
        link.external_attr = (stat.S_IFLNK | 0o777) << 16
        with zipfile.ZipFile(self.archive, "w") as output:
            output.writestr(link, "target")
        with self.assertRaisesRegex(ArchiveRejected, "unsupported_archive_entry"):
            inspect_archive(self.archive)

    def test_nested_archive_is_rejected(self):
        self.write_zip([("nested.zip", "not a real archive")])
        with self.assertRaisesRegex(ArchiveRejected, "nested_archive"):
            inspect_archive(self.archive)

    def test_duplicate_case_insensitive_path_is_rejected(self):
        self.write_zip([("Readme.md", "a"), ("README.md", "b")])
        with self.assertRaisesRegex(ArchiveRejected, "duplicate_archive_path"):
            inspect_archive(self.archive)

    def test_expanded_size_limit_is_rejected(self):
        self.write_zip([("large.txt", "12345")])
        with patch("archive_scan.MAX_EXPANDED_BYTES", 4):
            with self.assertRaisesRegex(ArchiveRejected, "archive_limit_exceeded"):
                inspect_archive(self.archive)

    def test_entry_limit_counts_directories(self):
        self.write_zip([("a/", ""), ("b/", ""), ("index.html", "ok")])
        with patch("archive_scan.MAX_FILES", 2):
            with self.assertRaisesRegex(ArchiveRejected, "archive_limit_exceeded"):
                inspect_archive(self.archive)

    def test_dot_segment_is_rejected(self):
        self.write_zip([("a/./index.html", "bad")])
        with self.assertRaisesRegex(ArchiveRejected, "invalid_archive_path"):
            inspect_archive(self.archive)

    def test_file_and_directory_conflict_is_rejected_before_extraction(self):
        self.write_zip([("assets/logo.svg", "icon"), ("assets", "file")])
        with self.assertRaisesRegex(ArchiveRejected, "archive_path_conflict"):
            inspect_archive(self.archive)


if __name__ == "__main__":
    unittest.main()
