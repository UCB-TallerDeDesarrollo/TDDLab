import { provisionBranchSyncCli } from '../controllers/TDDCycles/BranchSyncCliProvisioningController';
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import type { ErrorRequestHandler } from "express";
import { getTddPool } from "../config/tddDb";
import { BranchSyncController } from "../controllers/TDDCycles/BranchSyncController";
import { provisionBranchSync } from "../controllers/TDDCycles/BranchSyncProvisioningController";
import { SyncBranchHistoryUseCase } from "../modules/TDDCycles/Application/SyncBranchHistoryUseCase";
import type { ITDDHistoryRepository } from "../modules/TDDCycles/Domain/ITDDHistoryRepository";
import {
  authenticateBranchSyncToken,
  BranchSyncConfigurationError,
} from "../modules/TDDCycles/Infrastructure/BranchSyncCredentials";
import { PostgresTDDHistoryRepository } from "../modules/TDDCycles/Repositories/PostgresTDDHistoryRepository";

interface SyncRouterOptions {
  readonly repository?: Pick<ITDDHistoryRepository, "saveBatch">;
  readonly credentials?: () => string | undefined;
}

const postgres: Pick<ITDDHistoryRepository, "saveBatch"> = {
  saveBatch(batch) {
    let pool;
    try {
      pool = getTddPool();
    } catch {
      throw new BranchSyncConfigurationError();
    }
    return new PostgresTDDHistoryRepository(pool).saveBatch(batch);
  },
};

/** Mount before the legacy global JSON parser so only this route has a 2 MiB limit. */
export function createTDDHistorySyncRouter(options: SyncRouterOptions = {}) {
  if (!options.credentials) dotenv.config();
  const router = express.Router();
  const configuration =
    options.credentials ?? (() => process.env.TDD_SYNC_CREDENTIALS);
  const controller = new BranchSyncController(
    new SyncBranchHistoryUseCase(options.repository ?? postgres),
  );

  router.post(
    "/sync/credentials/cli",
    express.json({ limit: "4kb" }),
    provisionBranchSyncCli(configuration),
  );

  router.post(
    "/sync/credentials",
    cookieParser(),
    express.json({ limit: "4kb" }),
    provisionBranchSync(configuration),
  );

  router.post(
    "/sync",
    (req, res, next) => {
      try {
        const repository = authenticateBranchSyncToken(
          req.get("authorization"),
          configuration,
        );
        if (!repository) {
          res.set("WWW-Authenticate", "Bearer").status(401).json({
            code: "UNAUTHORIZED",
            message: "Se requiere un token de sincronización válido",
          });
          return;
        }
        res.locals.tddSyncRepository = repository;
        if (!req.is("application/json")) {
          res
            .status(415)
            .json({
              code: "JSON_REQUIRED",
              message: "Se requiere Content-Type application/json",
            });
          return;
        }
        next();
      } catch {
        res
          .status(503)
          .json({
            code: "SYNC_UNAVAILABLE",
            message: "La sincronización TDD no está configurada",
          });
      }
    },
    express.json({ limit: "2mb" }),
    async (req, res) => {
      await controller.sync(req, res, res.locals.tddSyncRepository);
    },
  );

  const handleParserError: ErrorRequestHandler = (error, req, res, next) => {
    if (error?.type === "entity.too.large") {
      res
        .status(413)
        .json({
          code: "PAYLOAD_TOO_LARGE",
          message: req.path.startsWith("/sync/credentials")
            ? "La solicitud supera el límite de 4 KiB"
            : "El lote supera el límite de 2 MiB",
        });
    } else if (error?.type === "entity.parse.failed") {
      res
        .status(400)
        .json({
          code: "INVALID_JSON",
          message: "El cuerpo no contiene JSON válido",
        });
    } else {
      next(error);
    }
  };
  router.use(handleParserError);
  return router;
}
