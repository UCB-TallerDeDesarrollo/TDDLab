import express from "express";
import cors from "cors"; // Import the cors middleware
import bodyParser from "body-parser";
import server from "./config/server";
import router from "./routes/userRoutes";
import assignmentsRouter from "./routes/assignmentRoutes";
import commitsRouter from "./routes/commitsRoutes";
import jobsRouter from "./routes/jobsRoutes";
import groupsRouter from "./routes/groupsRouter";

const app = express();
const port = 3000;
// Enable CORS for all routes
app.use(cors());

app.use(bodyParser.json());
app.use("/api/user", router);
app.use("/api/assignments", assignmentsRouter);
app.use("/api/commits", commitsRouter);
app.use("/api/jobs", jobsRouter);
app.use("/api/groups", groupsRouter);

server(app, port);
export default app;
