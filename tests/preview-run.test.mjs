import test from "node:test";
import assert from "node:assert/strict";
import { advancePreviewRun, createPreviewRun, findIdempotentPreviewRun } from "../src/lib/preview-run.ts";

const at = "2026-09-28T00:00:00.000Z";
const request = { workspaceId: "w1", projectId: "p1", artifactId: "a1", runtime: "static" };

test("a static run has an ordered, expiring path without install or build", () => {
  let run = createPreviewRun(request, "editor", "u1", "r1", "key-1", at);
  run = advancePreviewRun(run, "scanning", "2026-09-28T00:00:01.000Z");
  assert.throws(() => advancePreviewRun(run, "installing", "2026-09-28T00:00:02.000Z"));
  run = advancePreviewRun(run, "starting", "2026-09-28T00:00:02.000Z");
  run = advancePreviewRun(run, "running", "2026-09-28T00:00:03.000Z");
  assert.equal(run.expiresAt, "2026-09-28T00:30:03.000Z");
  assert.throws(() => advancePreviewRun(run, "failed", "2026-09-28T00:30:03.000Z", "timeout"));
  run = advancePreviewRun(run, "expired", "2026-09-28T00:30:03.000Z");
  assert.throws(() => advancePreviewRun(run, "running", "2026-09-28T00:30:04.000Z"));
});

test("viewer, competing runs, and invalid Node settings cannot start", () => {
  assert.throws(() => createPreviewRun(request, "viewer", "u1", "r1", "key-1", at));
  const active = createPreviewRun(request, "editor", "u1", "r1", "key-1", at);
  assert.throws(() => createPreviewRun({ ...request, artifactId: "a2" }, "editor", "u1", "r2", "key-2", at, [active]));
  assert.throws(() => createPreviewRun({ ...request, runtime: "node", startCommand: "npm run start", port: 0 }, "editor", "u1", "r2", "key-2", at));
});

test("idempotency returns the original result and rejects changed intent", () => {
  const run = createPreviewRun(request, "editor", "u1", "r1", "key-1", at);
  assert.deepEqual(findIdempotentPreviewRun([run], request, "key-1", at), run);
  assert.throws(() => findIdempotentPreviewRun([run], { ...request, artifactId: "a2" }, "key-1", at));
  assert.throws(() => createPreviewRun(request, "editor", "u1", "r2", "key-1", at, [run]));
});

test("failure records a code and cannot resume", () => {
  const run = createPreviewRun(request, "editor", "u1", "r1", "key-1", at);
  assert.throws(() => advancePreviewRun(run, "failed", at));
  const failed = advancePreviewRun(run, "failed", at, "invalid_archive");
  assert.equal(failed.errorCode, "invalid_archive");
  assert.throws(() => advancePreviewRun(failed, "scanning", at));
});
