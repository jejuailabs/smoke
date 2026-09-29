import { cpSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const product = resolve(import.meta.dirname, "..");
const destination = resolve(product, "..", "dist", "preview");
const result = spawnSync(process.execPath, [resolve(product, "node_modules", "next", "dist", "bin", "next"), "build"], {
  cwd: product,
  env: { ...process.env, SITE_PREVIEW_EXPORT: "1" },
  stdio: "inherit",
});
if (result.status !== 0) process.exit(result.status ?? 1);
const output = resolve(product, "out");
if (!existsSync(resolve(output, "ko", "index.html")) || !existsSync(resolve(output, "en", "workspace", "index.html")) || !existsSync(resolve(output, "ko", "experiments", "index.html")) || !existsSync(resolve(output, "ko", "intake", "index.html"))) {
  throw new Error("Preview export did not include required routes");
}
cpSync(output, destination, { recursive: true, force: true });
console.log(`Preview files copied to ${destination}`);
