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
import cookieParser from "cookie-parser";

const app = express();
const port = 3000;

const parseEnvOrigins = (value?: string): string[] => {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const allowedOrigins = new Set([
  ...parseEnvOrigins(process.env.FRONTEND_ORIGINS),
  process.env.VITE_FRONT_URL,
  "http://localhost:5173",
  "https://tddlab-staging-firebase.web.app",
  "https://tddlab-firebase.web.app",
].filter((origin): origin is string => Boolean(origin)));

const trustedFirebaseProjectOrigins = [
  /^https:\/\/tddlab(?:-staging)?-firebase\.web\.app$/,
  /^https:\/\/tddlab(?:-staging)?-firebase\.firebaseapp\.com$/,
];

const isAllowedOrigin = (origin: string) => {
  if (allowedOrigins.has(origin)) {
    return true;
  }

  return trustedFirebaseProjectOrigins.some((pattern) => pattern.test(origin));
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());

app.use(bodyParser.json());

app.use(cookieParser());

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
