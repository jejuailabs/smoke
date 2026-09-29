import test from "node:test";
import assert from "node:assert/strict";
import { evaluate, exampleMetrics } from "../src/lib/validation.ts";

test("required conversion blocks a pass despite a high score", () => {
  const result = evaluate(exampleMetrics);
  assert.equal(result.score, 92);
  assert.equal(result.decision, "learning");
});

test("insufficient sample blocks a pass", () => {
  const metrics = exampleMetrics.map((item) => ({ ...item, actual: item.target }));
  metrics[0].sample = 100;
  assert.equal(evaluate(metrics).decision, "insufficient");
});

test("all required criteria with enough evidence can pass", () => {
  const metrics = exampleMetrics.map((item) => ({ ...item, actual: item.target }));
  assert.equal(evaluate(metrics).decision, "pass");
});

test("invalid rules cannot produce a decision", () => {
  assert.throws(() => evaluate([{ ...exampleMetrics[0], target: 0 }]));
  assert.throws(() => evaluate([{ ...exampleMetrics[0], actual: Number.NaN }]));
  assert.throws(() => evaluate([exampleMetrics[0], exampleMetrics[0]]));
});

test("required rules alone do not pass below the score threshold", () => {
  const metrics = [
    { ...exampleMetrics[0], required: true, actual: exampleMetrics[0].target, weight: 10 },
    { ...exampleMetrics[1], required: false, actual: 0, weight: 90 },
  ];
  const result = evaluate(metrics);
  assert.equal(result.score, 10);
  assert.equal(result.decision, "learning");
  assert.equal(result.calculationVersion, "demo-v1");
});

test("explicit disproof floor distinguishes failure from learning", () => {
  const metrics = exampleMetrics.map((item) => ({ ...item }));
  metrics[2].actual = 19;
  assert.equal(evaluate(metrics).decision, "fail");
  metrics[2].actual = 24;
  assert.equal(evaluate(metrics).decision, "learning");
});
