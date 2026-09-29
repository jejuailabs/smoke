import test from "node:test";
import assert from "node:assert/strict";
import { checkArchivePreflight, maxArchiveBytes } from "../src/lib/archive-preflight.ts";

const zip = Uint8Array.from([0x50, 0x4b, 0x03, 0x04]);

test("a normal ZIP can proceed to isolated scanning", () => {
  assert.equal(checkArchivePreflight("product.ZIP", maxArchiveBytes, zip), "ready_for_worker_scan");
});

test("size, extension, and signature gates fail closed", () => {
  assert.equal(checkArchivePreflight("product.zip", maxArchiveBytes + 1, zip), "file_too_large");
  assert.equal(checkArchivePreflight("product.txt", 100, zip), "invalid_zip_header");
  assert.equal(checkArchivePreflight("product.zip", 100, Uint8Array.from([0x4d, 0x5a])), "invalid_zip_header");
  assert.equal(checkArchivePreflight("", 0, zip), "missing_file");
});
