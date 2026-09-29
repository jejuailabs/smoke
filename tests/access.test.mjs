import test from "node:test";
import assert from "node:assert/strict";
import { can } from "../src/lib/access.ts";

test("viewer cannot mutate project or approve external work", () => {
  assert.equal(can("viewer", "read"), true);
  assert.equal(can("viewer", "edit_project"), false);
  assert.equal(can("viewer", "approve_release"), false);
});

test("editor can edit but cannot connect or approve", () => {
  assert.equal(can("editor", "edit_project"), true);
  assert.equal(can("editor", "connect_channel"), false);
  assert.equal(can("editor", "approve_spend"), false);
});

test("admin can approve but only owner can manage members or delete", () => {
  assert.equal(can("admin", "approve_release"), true);
  assert.equal(can("admin", "manage_members"), false);
  assert.equal(can("owner", "manage_members"), true);
  assert.equal(can("owner", "delete_workspace"), true);
});
