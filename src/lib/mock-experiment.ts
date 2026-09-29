import { evaluate, type Metric } from "./validation.ts";

export const channelIds = ["meta", "youtube", "reddit"] as const;
export type ChannelId = (typeof channelIds)[number];
export type ExperimentInput = { audience: string; message: string; budgetUsd: number; channels: ChannelId[] };
export type ChannelMetrics = { channel: ChannelId; spendUsd: number; impressions: number; clicks: number; landingSessions: number; signups: number; activations: number; source: "DEMO_MOCK_ADAPTER" };

const profiles: Record<ChannelId, { impressionsPerDollar: number; clickRate: number; landingRate: number; signupRate: number; activationRate: number }> = {
  meta: { impressionsPerDollar: 90, clickRate: 0.032, landingRate: 0.91, signupRate: 0.09, activationRate: 0.27 },
  youtube: { impressionsPerDollar: 120, clickRate: 0.012, landingRate: 0.90, signupRate: 0.08, activationRate: 0.30 },
  reddit: { impressionsPerDollar: 70, clickRate: 0.025, landingRate: 0.88, signupRate: 0.11, activationRate: 0.34 },
};

export function runMockExperiment(input: ExperimentInput) {
  const channels = [...new Set(input.channels)];
  if (!input.audience.trim() || !input.message.trim() || !Number.isFinite(input.budgetUsd) || input.budgetUsd < 1 || input.budgetUsd > 1000 || channels.length === 0 || channels.some((id) => !channelIds.includes(id))) {
    throw new Error("Invalid mock experiment input");
  }
  const budgetCents = Math.round(input.budgetUsd * 100);
  const baseCents = Math.floor(budgetCents / channels.length);
  const results: ChannelMetrics[] = channels.map((channel, index) => {
    const spendCents = index === channels.length - 1 ? budgetCents - baseCents * (channels.length - 1) : baseCents;
    const profile = profiles[channel];
    const impressions = Math.round(spendCents / 100 * profile.impressionsPerDollar);
    const clicks = Math.round(impressions * profile.clickRate);
    const landingSessions = Math.round(clicks * profile.landingRate);
    const signups = Math.round(landingSessions * profile.signupRate);
    const activations = Math.round(signups * profile.activationRate);
    return { channel, spendUsd: spendCents / 100, impressions, clicks, landingSessions, signups, activations, source: "DEMO_MOCK_ADAPTER" };
  });
  const totals = results.reduce((sum, item) => ({
    spendUsd: sum.spendUsd + item.spendUsd,
    impressions: sum.impressions + item.impressions,
    clicks: sum.clicks + item.clicks,
    landingSessions: sum.landingSessions + item.landingSessions,
    signups: sum.signups + item.signups,
    activations: sum.activations + item.activations,
  }), { spendUsd: 0, impressions: 0, clicks: 0, landingSessions: 0, signups: 0, activations: 0 });
  totals.spendUsd = Math.round(totals.spendUsd * 100) / 100;
  const rules: Metric[] = [
    { id: "signup", label: "Landing signup", actual: totals.landingSessions ? totals.signups / totals.landingSessions * 100 : 0, target: 8, sample: totals.landingSessions, minimumSample: 200, weight: 35, required: false, unit: "%" },
    { id: "activation", label: "Activation", actual: totals.signups ? totals.activations / totals.signups * 100 : 0, target: 30, sample: totals.signups, minimumSample: 40, weight: 65, required: true, unit: "%", disproofFloor: 20 },
  ];
  return { mode: "demo" as const, input: { ...input, channels }, channels: results, totals, rules, validation: evaluate(rules) };
}
