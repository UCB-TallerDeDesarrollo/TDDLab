import { createHash, timingSafeEqual } from "node:crypto";
import type { RequestHandler } from "express";
import { parseBranchSyncRepository } from "../../modules/TDDCycles/Application/normalizeBranchSyncData";
import { InvalidTDDHistoryBatchError } from "../../modules/TDDCycles/Domain/TDDHistory";
import {
  BranchSyncConfigurationError,
  deriveBranchSyncToken,
} from "../../modules/TDDCycles/Infrastructure/BranchSyncCredentials";

function hashesEqual(a: string, b: string): boolean {
  return timingSafeEqual(
    createHash("sha256").update(a).digest(),
    createHash("sha256").update(b).digest(),
  );
}

function syncCliUrl(): string {
  const value = process.env.TDD_SYNC_CLI_URL?.trim();
  if (!value) throw new BranchSyncConfigurationError();

  const url = new URL(value);
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);

  if (
    (url.protocol !== "https:" && !(local && url.protocol === "http:")) ||
    url.username || url.password || url.search || url.hash
  ) {
    throw new BranchSyncConfigurationError();
  }

  return url.href;
}

export const provisionBranchSyncCli: RequestHandler = (req, res) => {
  res.set("Cache-Control", "no-store");

  try {
    const expectedCode = process.env.TDD_SETUP_CODE?.trim();
    const suppliedCode = req.get("x-tdd-setup-code")?.trim();

    if (!expectedCode || expectedCode.length < 6) {
      throw new BranchSyncConfigurationError();
    }

    if (!suppliedCode || !hashesEqual(suppliedCode, expectedCode)) {
      res.status(401).json({
        code: "INVALID_SETUP_CODE",
        message: "Código de configuración TDDLab inválido",
      });
      return;
    }

    const repository = parseBranchSyncRepository(req.body?.repository);

    res.json({
      TDD_SYNC_URL: syncCliUrl(),
      TDD_SYNC_TOKEN: deriveBranchSyncToken(repository),
    });
  } catch (error) {
    if (error instanceof InvalidTDDHistoryBatchError) {
      res.status(400).json({
        code: "INVALID_REPOSITORY",
        message: error.message,
      });
      return;
    }

    res.status(503).json({
      code: "SYNC_UNAVAILABLE",
      message: "La configuración CLI de TDDLab no está disponible",
    });
  }
};
