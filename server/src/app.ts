import express from "express";
import cors from "cors"; // Import the cors middleware
import bodyParser from "body-parser";
import server from "./config/server";
import router from "./routes/userRoutes";
import assignmentsRouter from "./routes/assignmentRoutes";
import TDDCyclesRouter from "./routes/TDDCyclesRoutes";
import groupsRouter from "./routes/groupsRouter";
import submissionsRouter from "./routes/submissionRoutes";
import teacherCommentsOnSubmissionRouter from "./routes/teacherCommentsOnSubmissionsRoutes";
import practicesRouter from "./routes/practicesRoutes";
import practiceSubmissionsRouter from "./routes/practiceSubmissionsRoutes";

const app = express();
const port = 3000;
// Enable CORS for all routes
app.use(cors());

app.use(bodyParser.json());
app.use("/api/user", router);
app.use("/api/assignments", assignmentsRouter);
app.use("/api/TDDCycles", TDDCyclesRouter);
app.use("/api/groups", groupsRouter);
app.use("/api/submissions", submissionsRouter);
app.use("/api/commentsSubmission", teacherCommentsOnSubmissionRouter);
app.use("/api/practices", practicesRouter);
app.use("/api/practiceSubmissions", practiceSubmissionsRouter);

server(app, port);
export default app;
