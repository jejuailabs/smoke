import { channelIds, runMockExperiment, type ExperimentInput } from "./mock-experiment.ts";
import { demoPolicy } from "./validation.ts";

export const demoHistoryKey = "launchops:demo-experiments:v1";
export type DemoRun = { id: string; createdAt: string; calculationVersion: string; input: ExperimentInput };
const maxRuns = 10;

export function addDemoRun(history: DemoRun[], input: ExperimentInput, id: string, createdAt: string): DemoRun[] {
  runMockExperiment(input);
  if (!id || !Number.isFinite(Date.parse(createdAt))) throw new Error("Invalid demo run metadata");
  return [{ id, createdAt, calculationVersion: demoPolicy.calculationVersion,
    input: { audience: input.audience.trim(), message: input.message.trim(), budgetUsd: input.budgetUsd, channels: [...new Set(input.channels)] } },
  ...history.filter((run) => run.id !== id)].slice(0, maxRuns);
}

export function parseDemoHistory(raw: string | null): DemoRun[] {
  if (!raw || raw.length > 50_000) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    const ids = new Set<string>();
    const result: DemoRun[] = [];
    for (const candidate of data.slice(0, maxRuns)) {
      if (!candidate || typeof candidate !== "object") continue;
      const run = candidate as Record<string, unknown>;
      if (typeof run.id !== "string" || !run.id || ids.has(run.id) || typeof run.createdAt !== "string" || !Number.isFinite(Date.parse(run.createdAt)) || run.calculationVersion !== demoPolicy.calculationVersion) continue;
      const value = run.input as Record<string, unknown> | null;
      if (!value || typeof value.audience !== "string" || value.audience.length > 160 || typeof value.message !== "string" || value.message.length > 300 || typeof value.budgetUsd !== "number" || !Array.isArray(value.channels) || value.channels.some((id) => !channelIds.includes(id))) continue;
      const input: ExperimentInput = { audience: value.audience, message: value.message, budgetUsd: value.budgetUsd, channels: value.channels };
      try { runMockExperiment(input); } catch { continue; }
      ids.add(run.id);
      result.push({ id: run.id, createdAt: run.createdAt, calculationVersion: demoPolicy.calculationVersion, input });
    }
    return result;
  } catch { return []; }
}
