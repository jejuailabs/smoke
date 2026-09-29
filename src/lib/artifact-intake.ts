import { can, type WorkspaceRole } from "./access.ts";
import { maxArchiveBytes } from "./archive-preflight.ts";

export type ArtifactReservation = {
  id: string;
  workspaceId: string;
  projectId: string;
  requestedBy: string;
  pathname: string;
  status: "reserved" | "queued" | "rejected";
  actualSizeBytes?: number;
  etag?: string;
  errorCode?: string;
};
export type TrustedBlobMetadata = { pathname: string; size: number; etag: string; storeAccess: "private" | "public" };

const safeId = /^[A-Za-z0-9_-]{1,128}$/;

export function reserveArtifact(workspaceId: string, projectId: string, artifactId: string, filename: string, claimedSizeBytes: number, role: WorkspaceRole | null, actorId: string): ArtifactReservation {
  if (!can(role, "edit_project") || !actorId.trim() || !safeId.test(workspaceId) || !safeId.test(projectId) || !safeId.test(artifactId) || !filename.toLowerCase().endsWith(".zip") || !Number.isInteger(claimedSizeBytes) || claimedSizeBytes < 1 || claimedSizeBytes > maxArchiveBytes) throw new Error("Artifact reservation denied");
  return { id: artifactId, workspaceId, projectId, requestedBy: actorId, pathname: `artifacts/${workspaceId}/${projectId}/${artifactId}.zip`, status: "reserved" };
}

// metadata must come from an authenticated storage HEAD, not the browser or callback body.
export function completeArtifact(reservation: ArtifactReservation, metadata: TrustedBlobMetadata): ArtifactReservation {
  if (metadata.storeAccess !== "private" || metadata.pathname !== reservation.pathname || !metadata.etag.trim() || !Number.isInteger(metadata.size) || metadata.size < 1) throw new Error("Blob metadata mismatch");
  if (reservation.status === "queued") {
    if (reservation.actualSizeBytes === metadata.size && reservation.etag === metadata.etag) return reservation;
    throw new Error("Artifact changed after completion");
  }
  if (reservation.status !== "reserved") throw new Error("Artifact is terminal");
  if (metadata.size > maxArchiveBytes) return { ...reservation, status: "rejected", actualSizeBytes: metadata.size, etag: metadata.etag, errorCode: "archive_limit_exceeded" };
  return { ...reservation, status: "queued", actualSizeBytes: metadata.size, etag: metadata.etag };
}
