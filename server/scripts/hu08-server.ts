/** Local QA entry point. Uses the production router and repository factory. */
import express from "express";
import cors from "cors";
import TDDCyclesRouter from "../src/routes/TDDCyclesRoutes";
import { tddCyclesJsonErrorHandler } from "../src/middleware/tddCyclesJsonErrorHandler";
const app = express();
app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173"] }));
app.use(express.json());
app.use("/api/TDDCycles", TDDCyclesRouter);
app.use(tddCyclesJsonErrorHandler);
const server = app.listen(3008, "127.0.0.1", () => console.log("HU08 QA API http://127.0.0.1:3008/api"));
process.on("SIGTERM", () => server.close());
