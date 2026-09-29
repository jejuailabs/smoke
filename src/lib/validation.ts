export type Metric = { id: string; label: string; actual: number; target: number; sample: number; minimumSample: number; weight: number; required: boolean; unit: string; disproofFloor?: number };
export type Decision = "pass" | "insufficient" | "fail" | "learning";
export type ValidationPolicy = { minimumScore: number; calculationVersion: string };
export const demoPolicy: ValidationPolicy = { minimumScore: 70, calculationVersion: "demo-v1" };

export function evaluate(metrics: Metric[], policy: ValidationPolicy = demoPolicy): { score: number; decision: Decision; passed: number; total: number; calculationVersion: string } {
  const ids = new Set(metrics.map((metric) => metric.id));
  if (!metrics.length || ids.size !== metrics.length || !Number.isFinite(policy.minimumScore) || policy.minimumScore < 0 || policy.minimumScore > 100 || !policy.calculationVersion || metrics.some((metric) =>
    !Number.isFinite(metric.actual) || metric.actual < 0 || !Number.isFinite(metric.target) || metric.target <= 0 || !Number.isFinite(metric.weight) || metric.weight <= 0 || !Number.isInteger(metric.minimumSample) || metric.minimumSample < 0 || !Number.isInteger(metric.sample) || metric.sample < 0 || (metric.disproofFloor !== undefined && (!Number.isFinite(metric.disproofFloor) || metric.disproofFloor < 0 || metric.disproofFloor > metric.target))
  )) {
    throw new Error("Invalid validation rules");
  }
  const totalWeight = metrics.reduce((sum, metric) => sum + metric.weight, 0);
  const score = Math.round(metrics.reduce((sum, metric) => sum + Math.min(100, Math.max(0, metric.actual / metric.target * 100)) * metric.weight, 0) / totalWeight);
  const passed = metrics.filter((metric) => metric.sample >= metric.minimumSample && metric.actual >= metric.target).length;
  let decision: Decision = "learning";
  if (metrics.some((metric) => metric.sample < metric.minimumSample)) decision = "insufficient";
  else if (metrics.some((metric) => metric.required && metric.disproofFloor !== undefined && metric.actual < metric.disproofFloor)) decision = "fail";
  else if (score >= policy.minimumScore && metrics.every((metric) => !metric.required || metric.actual >= metric.target)) decision = "pass";
  return { score, decision, passed, total: metrics.length, calculationVersion: policy.calculationVersion };
}

export const exampleMetrics: Metric[] = [
  { id: "ctr", label: "Meta CTR", actual: 3.1, target: 2.5, sample: 6200, minimumSample: 5000, weight: 10, required: false, unit: "%" },
  { id: "signup", label: "Landing signup", actual: 9.2, target: 8, sample: 240, minimumSample: 200, weight: 25, required: false, unit: "%" },
  { id: "activation", label: "Activation", actual: 24, target: 30, sample: 48, minimumSample: 40, weight: 40, required: true, unit: "%", disproofFloor: 20 },
  { id: "positive", label: "Positive evidence", actual: 68, target: 65, sample: 25, minimumSample: 20, weight: 25, required: false, unit: "%" },
];
