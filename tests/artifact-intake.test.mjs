import test from "node:test";
import assert from "node:assert/strict";
import { completeArtifact, reserveArtifact } from "../src/lib/artifact-intake.ts";

const reserve = () => reserveArtifact("w1", "p1", "a1", "product.zip", 1024, "editor", "u1");

test("only editors can reserve an artifact with a generated safe path", () => {
  assert.equal(reserve().pathname, "artifacts/w1/p1/a1.zip");
  assert.throws(() => reserveArtifact("w1", "p1", "a1", "product.zip", 1024, "viewer", "u1"));
  assert.throws(() => reserveArtifact("../other", "p1", "a1", "product.zip", 1024, "editor", "u1"));
});

test("trusted private metadata completes once and rejects changed bytes", () => {
  const metadata = { pathname: reserve().pathname, size: 1024, etag: "etag-1", storeAccess: "private" };
  const queued = completeArtifact(reserve(), metadata);
  assert.equal(queued.status, "queued");
  assert.deepEqual(completeArtifact(queued, metadata), queued);
  assert.throws(() => completeArtifact(queued, { ...metadata, etag: "etag-2" }));
  assert.throws(() => completeArtifact(reserve(), { ...metadata, storeAccess: "public" }));
  assert.throws(() => completeArtifact(reserve(), { ...metadata, pathname: "artifacts/w1/p2/a1.zip" }));
});

test("actual stored size controls rejection even when claimed size was small", () => {
  const rejected = completeArtifact(reserve(), { pathname: reserve().pathname, size: 100 * 1024 * 1024 + 1, etag: "etag-1", storeAccess: "private" });
  assert.equal(rejected.status, "rejected");
  assert.equal(rejected.errorCode, "archive_limit_exceeded");
});
