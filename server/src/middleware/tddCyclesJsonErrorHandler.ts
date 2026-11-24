import { ErrorRequestHandler } from "express";

export const tddCyclesJsonErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (req.method === "POST" && /^\/api\/TDDCycles\/jobs\/?$/i.test(req.path) &&
      error instanceof SyntaxError && "type" in error && error.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON", field: "body" });
  }
  return next(error);
};
