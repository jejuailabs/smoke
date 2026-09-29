import { can, type WorkspaceRole } from "./access.ts";

export type Evidence = {
  id: string;
  source: "meta" | "youtube" | "reddit" | "product";
  mode: "live" | "demo";
  verified: boolean;
  sample: number;
  observedAt: string;
};
export type ValidationSnapshot = {
  id: string;
  decision: "pass" | "learning" | "fail" | "insufficient";
  calculationVersion: string;
  evaluatedAt: string;
  evidenceIds: string[];
};
export type Claim = { text: string; evidenceIds: string[] };
export type ReleaseDraft = {
  validationRunId: string;
  calculationVersion: string;
  claims: Claim[];
  status: "draft" | "approved";
  approvedBy?: string;
};

function validTime(value: string): boolean {
  return Number.isFinite(Date.parse(value));
}

export function prepareRelease(snapshot: ValidationSnapshot, evidence: Evidence[], claims: Claim[]): ReleaseDraft {
  if (snapshot.decision !== "pass" || !snapshot.id || !snapshot.calculationVersion || !validTime(snapshot.evaluatedAt) || !claims.length) {
    throw new Error("Release requires a passing validation run and claims");
  }
  const validatedIds = new Set(snapshot.evidenceIds);
  const evidenceById = new Map(evidence.map((item) => [item.id, item]));
  if (validatedIds.size !== snapshot.evidenceIds.length || evidenceById.size !== evidence.length) throw new Error("Duplicate evidence ID");
  for (const claim of claims) {
    if (!claim.text.trim() || claim.evidenceIds.length === 0 || new Set(claim.evidenceIds).size !== claim.evidenceIds.length) {
      throw new Error("Claim requires distinct evidence links");
    }
    for (const id of claim.evidenceIds) {
      const item = evidenceById.get(id);
      if (!validatedIds.has(id) || !item || item.mode !== "live" || !item.verified || !Number.isInteger(item.sample) || item.sample <= 0 || !validTime(item.observedAt) || Date.parse(item.observedAt) > Date.parse(snapshot.evaluatedAt)) {
        throw new Error("Claim contains ineligible evidence");
      }
    }
  }
  return { validationRunId: snapshot.id, calculationVersion: snapshot.calculationVersion, claims: claims.map((claim) => ({ text: claim.text.trim(), evidenceIds: [...claim.evidenceIds] })), status: "draft" };
}

// Domain guard only. The eventual server endpoint must independently verify the actor's role.
export function approveRelease(draft: ReleaseDraft, role: WorkspaceRole | null, actorId: string): ReleaseDraft {
  if (draft.status !== "draft" || !can(role, "approve_release") || !actorId.trim()) throw new Error("Release approval denied");
  return { ...draft, status: "approved", approvedBy: actorId };
}
