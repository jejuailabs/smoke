import test from "node:test";
import assert from "node:assert/strict";
import { addDemoRun, parseDemoHistory } from "../src/lib/demo-history.ts";

const input = { audience: "Founders", message: "Launch with evidence", budgetUsd: 300, channels: ["meta", "reddit"] };

test("history is bounded and restores valid runs", () => {
  let history = [];
  for (let index = 0; index < 12; index++) history = addDemoRun(history, input, String(index), "2026-09-28T00:00:00.000Z");
  assert.equal(history.length, 10);
  assert.equal(parseDemoHistory(JSON.stringify(history)).length, 10);
  assert.equal(history[0].id, "11");
});

test("corrupt, stale, and ineligible runs are discarded", () => {
  const valid = addDemoRun([], input, "valid", "2026-09-28T00:00:00.000Z")[0];
  const stale = { ...valid, id: "old", calculationVersion: "demo-v0" };
  const invalid = { ...valid, id: "bad", input: { ...input, channels: ["unknown"] } };
  assert.deepEqual(parseDemoHistory(JSON.stringify([stale, invalid, valid])), [valid]);
  assert.deepEqual(parseDemoHistory("{"), []);
});
