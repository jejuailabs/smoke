import test from "node:test";
import assert from "node:assert/strict";
import { runMockExperiment } from "../src/lib/mock-experiment.ts";

const input = { audience: "Solo founders", message: "Validate before launch", budgetUsd: 100, channels: ["meta", "youtube", "reddit"] };

test("mock adapter stays within budget and never creates more conversions than visits", () => {
  const result = runMockExperiment(input);
  assert.equal(result.mode, "demo");
  assert.equal(result.totals.spendUsd, 100);
  assert.equal(result.channels.length, 3);
  for (const row of result.channels) {
    assert.equal(row.source, "DEMO_MOCK_ADAPTER");
    assert.ok(row.activations <= row.signups);
    assert.ok(row.signups <= row.landingSessions);
    assert.ok(row.landingSessions <= row.clicks);
  }
});

test("same input creates reproducible demo results", () => {
  assert.deepEqual(runMockExperiment(input), runMockExperiment(input));
});

test("low budget remains insufficient evidence even with a high rate", () => {
  const result = runMockExperiment({ ...input, budgetUsd: 2, channels: ["reddit"] });
  assert.equal(result.validation.decision, "insufficient");
});

test("invalid or duplicate channels cannot inflate spend", () => {
  assert.throws(() => runMockExperiment({ ...input, channels: [] }));
  const result = runMockExperiment({ ...input, channels: ["meta", "meta"] });
  assert.equal(result.channels.length, 1);
  assert.equal(result.totals.spendUsd, 100);
});
