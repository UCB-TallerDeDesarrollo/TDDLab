import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";

const repoRoot = process.cwd();
const envPath = path.join(repoRoot, "server", ".env");
const setupCode = process.argv[2]?.trim() || "TDD2026";

let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";

const values = {
  TDD_SETUP_CODE: setupCode,
  TDD_SYNC_MASTER_SECRET: randomBytes(32).toString("hex"),
  TDD_SYNC_CLI_URL: "http://localhost:3000/api/TDDCycles/sync/cli",
};

function upsert(source, key, value) {
  const line = `${key}=${value}`;
  const regex = new RegExp(`^${key}=.*$`, "m");
  if (regex.test(source)) return source.replace(regex, line);
  return `${source.replace(/\s*$/, "")}\n${line}\n`;
}

for (const [key, value] of Object.entries(values)) {
  if (
    key === "TDD_SYNC_MASTER_SECRET" &&
    new RegExp(`^${key}=.+$`, "m").test(content)
  ) continue;

  content = upsert(content, key, value);
}

fs.writeFileSync(envPath, content, "utf8");

console.log("Configuración local MVP lista.");
console.log(`Código de setup: ${setupCode}`);
console.log("URL de sync CLI: http://localhost:3000/api/TDDCycles/sync/cli");
