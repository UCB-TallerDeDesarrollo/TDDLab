import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const frontendDir = resolve(currentDir, "..");
const serverDir = resolve(frontendDir, "..", "server");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const spawnOptions = {
  stdio: "inherit",
  shell: process.platform === "win32",
};

const server = spawn(npmCommand, ["run", "dev"], {
  cwd: serverDir,
  ...spawnOptions,
});

const frontend = spawn(npmCommand, ["run", "dev:vite"], {
  cwd: frontendDir,
  ...spawnOptions,
});

let shuttingDown = false;

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  server.kill("SIGINT");
  frontend.kill("SIGINT");
  setTimeout(() => process.exit(exitCode), 250);
}

process.on("SIGINT", () => shutdown());
process.on("SIGTERM", () => shutdown());

server.on("exit", (code) => {
  if (!shuttingDown && code && code !== 0) shutdown(code);
});

frontend.on("exit", (code) => {
  if (!shuttingDown && code && code !== 0) shutdown(code);
});
