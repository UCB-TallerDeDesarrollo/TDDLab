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
import aiAssistantRouter from "./routes/AIAssistant";
import featureFlagsRouter from "./routes/featureFlagsRoutes";

const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json()); 

app.use(bodyParser.json());

// Define routes
app.use("/api/user", router);
app.use("/api/assignments", assignmentsRouter);
app.use("/api/TDDCycles", TDDCyclesRouter);
app.use("/api/groups", groupsRouter);
app.use("/api/submissions", submissionsRouter);
app.use("/api/commentsSubmission", teacherCommentsOnSubmissionRouter);
app.use("/api/practices", practicesRouter);
app.use("/api/practiceSubmissions", practiceSubmissionsRouter);
app.use("/api/AIAssistant", aiAssistantRouter);


app.use("/api/featureFlags", featureFlagsRouter);

// Start the server
server(app, port);
export default app;
