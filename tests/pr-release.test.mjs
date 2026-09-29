import test from "node:test";
import assert from "node:assert/strict";
import { approveRelease, prepareRelease } from "../src/lib/pr-release.ts";

const snapshot = { id: "run-1", decision: "pass", calculationVersion: "v1", evaluatedAt: "2026-09-28T00:00:00Z", evidenceIds: ["e1"] };
const evidence = [{ id: "e1", source: "product", mode: "live", verified: true, sample: 100, observedAt: "2026-09-27T00:00:00Z" }];
const claims = [{ text: "Activation improved", evidenceIds: ["e1"] }];

test("passing run and live verified evidence create a draft", () => {
  const draft = prepareRelease(snapshot, evidence, claims);
  assert.equal(draft.status, "draft");
  assert.equal(draft.validationRunId, "run-1");
});

test("demo evidence and unlinked claims cannot enter a release", () => {
  assert.throws(() => prepareRelease(snapshot, [{ ...evidence[0], mode: "demo" }], claims));
  assert.throws(() => prepareRelease(snapshot, evidence, [{ text: "Unsupported", evidenceIds: ["missing"] }]));
  assert.throws(() => prepareRelease(snapshot, evidence, [{ text: "No source", evidenceIds: [] }]));
});

test("nonpassing or future evidence cannot enter a release", () => {
  assert.throws(() => prepareRelease({ ...snapshot, decision: "learning" }, evidence, claims));
  assert.throws(() => prepareRelease(snapshot, [{ ...evidence[0], observedAt: "2026-09-29T00:00:00Z" }], claims));
});

test("only admin or owner can approve a prepared release", () => {
  const draft = prepareRelease(snapshot, evidence, claims);
  assert.throws(() => approveRelease(draft, "editor", "u1"));
  const approved = approveRelease(draft, "admin", "u2");
  assert.equal(approved.status, "approved");
  assert.equal(approved.approvedBy, "u2");
  assert.throws(() => approveRelease(approved, "owner", "u3"));
});
