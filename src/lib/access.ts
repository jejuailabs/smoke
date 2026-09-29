export type WorkspaceRole = "owner" | "admin" | "editor" | "viewer";
export type Action = "read" | "edit_project" | "connect_channel" | "approve_spend" | "approve_release" | "manage_members" | "delete_workspace";

const permissions: Record<WorkspaceRole, readonly Action[]> = {
  owner: ["read", "edit_project", "connect_channel", "approve_spend", "approve_release", "manage_members", "delete_workspace"],
  admin: ["read", "edit_project", "connect_channel", "approve_spend", "approve_release"],
  editor: ["read", "edit_project"],
  viewer: ["read"],
};

export function can(role: WorkspaceRole | null | undefined, action: Action): boolean {
  return role !== null && role !== undefined && permissions[role].includes(action);
}
