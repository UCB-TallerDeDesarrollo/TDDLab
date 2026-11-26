import type { RequestHandler } from "express";
import { parseBranchSyncRepository } from "../../modules/TDDCycles/Application/normalizeBranchSyncData";
import { InvalidTDDHistoryBatchError } from "../../modules/TDDCycles/Domain/TDDHistory";
import { getProvisionedBranchSyncToken } from "../../modules/TDDCycles/Infrastructure/BranchSyncCredentials";
import { decodeUserTokenFromCookie } from "../../modules/Users/Application/decodeUserTokenFromCookie";

function sessionUserId(cookie: unknown): number | undefined {
  if (typeof cookie !== "string" || !process.env.JWT_SECRET) return undefined;
  try {
    const session = decodeUserTokenFromCookie(cookie);
    if (session && Number.isSafeInteger(session.id) && session.id > 0) return session.id;
  } catch {
    return undefined;
  }
  return undefined;
}

function syncUrl(): string {
  const url = new URL(process.env.TDD_SYNC_URL ?? "");
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (
    (url.protocol !== "https:" && !(local && url.protocol === "http:")) ||
    url.username || url.password || url.search || url.hash
  ) {
    throw new Error("Invalid synchronization URL");
  }
  return url.href;
}

export function provisionBranchSync(
  configuration: () => string | undefined,
): RequestHandler {
  return (req, res) => {
    res.set("Cache-Control", "no-store");
    const userId = sessionUserId(req.cookies?.userSession);
    if (userId === undefined) {
      res.status(401).json({ code: "UNAUTHORIZED", message: "Se requiere una sesión válida" });
      return;
    }
    if (!req.is("application/json")) {
      res.status(415).json({ code: "JSON_REQUIRED", message: "Se requiere Content-Type application/json" });
      return;
    }
    try {
      const repository = parseBranchSyncRepository(req.body?.repository);
      const token = getProvisionedBranchSyncToken(userId, repository, configuration);
      if (!token) {
        res.status(403).json({ code: "REPOSITORY_FORBIDDEN", message: "El usuario no tiene acceso a esta credencial" });
        return;
      }
      res.json({ TDD_SYNC_URL: syncUrl(), TDD_SYNC_TOKEN: token });
    } catch (error) {
      if (error instanceof InvalidTDDHistoryBatchError) {
        res.status(400).json({ code: "INVALID_REPOSITORY", message: error.message });
        return;
      }
      res.status(503).json({ code: "SYNC_UNAVAILABLE", message: "El aprovisionamiento TDD no está configurado" });
    }
  };
}
