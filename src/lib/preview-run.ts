import { can, type WorkspaceRole } from "./access.ts";

export type PreviewRuntime = "static" | "node";
export type PreviewStage = "queued" | "scanning" | "installing" | "building" | "starting" | "running" | "failed" | "stopped" | "expired";
export type PreviewRequest = {
  workspaceId: string;
  projectId: string;
  artifactId: string;
  runtime: PreviewRuntime;
  buildCommand?: string;
  startCommand?: string;
  port?: number;
};
export type PreviewRun = PreviewRequest & {
  id: string;
  requestedBy: string;
  idempotencyKey: string;
  stage: PreviewStage;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  errorCode?: string;
};

const activeStages: ReadonlySet<PreviewStage> = new Set(["queued", "scanning", "installing", "building", "starting", "running"]);
const transitions: Record<PreviewStage, readonly PreviewStage[]> = {
  queued: ["scanning", "failed", "stopped"],
  scanning: ["installing", "starting", "failed", "stopped"],
  installing: ["building", "starting", "failed", "stopped"],
  building: ["starting", "failed", "stopped"],
  starting: ["running", "failed", "stopped"],
  running: ["failed", "stopped", "expired"],
  failed: [], stopped: [], expired: [],
};

function validTime(value: string): number {
  const time = Date.parse(value);
  if (!Number.isFinite(time)) throw new Error("Invalid preview time");
  return time;
}

function sameRequest(run: PreviewRun, request: PreviewRequest): boolean {
  return run.workspaceId === request.workspaceId && run.projectId === request.projectId && run.artifactId === request.artifactId && run.runtime === request.runtime && run.buildCommand === request.buildCommand && run.startCommand === request.startCommand && run.port === request.port;
}

export function findIdempotentPreviewRun(runs: PreviewRun[], request: PreviewRequest, idempotencyKey: string, at: string): PreviewRun | null {
  validTime(at);
  const previous = runs.find((run) => run.idempotencyKey === idempotencyKey);
  if (previous && !sameRequest(previous, request)) throw new Error("Idempotency key reused for another request");
  return previous ?? null;
}

export function createPreviewRun(request: PreviewRequest, role: WorkspaceRole | null, actorId: string, id: string, idempotencyKey: string, at: string, existing: PreviewRun[] = []): PreviewRun {
  validTime(at);
  if (!can(role, "edit_project") || !actorId.trim() || !id.trim() || !idempotencyKey.trim() || !request.workspaceId.trim() || !request.projectId.trim() || !request.artifactId.trim() || !["static", "node"].includes(request.runtime)) throw new Error("Preview request denied");
  if (request.runtime === "node" && (!request.startCommand?.trim() || !Number.isInteger(request.port) || request.port! < 1 || request.port! > 65535)) throw new Error("Node preview settings required");
  if ((request.startCommand && request.startCommand.length > 200) || (request.buildCommand && request.buildCommand.length > 200)) throw new Error("Preview command too long");
  if (request.runtime === "static" && (request.buildCommand || request.startCommand || request.port)) throw new Error("Static preview has no commands");
  if (existing.some((run) => run.idempotencyKey === idempotencyKey)) throw new Error("Resolve idempotent request first");
  if (existing.some((run) => run.workspaceId === request.workspaceId && activeStages.has(run.stage) && (!run.expiresAt || validTime(run.expiresAt) > validTime(at)))) throw new Error("Workspace preview already active");
  return { ...request, id, requestedBy: actorId, idempotencyKey, stage: "queued", createdAt: at, updatedAt: at };
}

export function advancePreviewRun(run: PreviewRun, next: PreviewStage, at: string, errorCode?: string): PreviewRun {
  const time = validTime(at);
  if (time < validTime(run.updatedAt) || !transitions[run.stage].includes(next) || (run.expiresAt && time >= validTime(run.expiresAt) && next !== "expired" && next !== "stopped")) throw new Error("Invalid preview transition");
  if (next === "installing" && run.runtime !== "node") throw new Error("Static preview cannot install packages");
  if (next === "building" && (run.runtime !== "node" || !run.buildCommand)) throw new Error("Build stage not configured");
  if (next === "failed" && !errorCode?.trim()) throw new Error("Failure requires error code");
  if (next !== "failed" && errorCode) throw new Error("Unexpected error code");
  return { ...run, stage: next, updatedAt: at, ...(next === "running" ? { expiresAt: new Date(time + 30 * 60 * 1000).toISOString() } : {}), ...(next === "failed" ? { errorCode } : {}) };
}
