import json
import tempfile
import unittest
import zipfile
from pathlib import Path

from archive_scan import ArchiveRejected
from product_detect import inspect_product


class ProductDetectTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.archive = Path(self.temp.name) / "product.zip"

    def write_zip(self, entries):
        with zipfile.ZipFile(self.archive, "w") as output:
            for name, content in entries:
                output.writestr(name, content)

    def test_wrapped_static_site_prefers_no_code_execution(self):
        self.write_zip([
            ("demo/index.html", "<h1>Preview</h1>"),
            ("demo/package.json", json.dumps({"scripts": {"start": "node server.js"}})),
        ])
        result = inspect_product(self.archive)
        self.assertEqual(result.runtime, "static")
        self.assertEqual(result.entry_root, "demo/")
        self.assertIsNone(result.start_command)
        self.assertEqual(len(result.checksum_sha256), 64)

    def test_node_suggestion_uses_lockfile_without_running_scripts(self):
        self.write_zip([
            ("package.json", json.dumps({"scripts": {"build": "next build", "start": "next start"}})),
            ("package-lock.json", "{}"),
        ])
        result = inspect_product(self.archive)
        self.assertEqual((result.runtime, result.install_command, result.build_command, result.start_command),
                         ("node", "npm ci", "npm run build", "npm run start"))
        self.assertTrue(result.needs_review)

    def test_malformed_manifest_rejected(self):
        self.write_zip([("package.json", "{"), ("index.txt", "hello")])
        with self.assertRaisesRegex(ArchiveRejected, "invalid_package_manifest"):
            inspect_product(self.archive)

    def test_unknown_layout_is_not_executable(self):
        self.write_zip([("README.md", "hello")])
        result = inspect_product(self.archive)
        self.assertEqual(result.runtime, "unsupported")
        self.assertIsNone(result.start_command)


if __name__ == "__main__":
    unittest.main()
