import express from "express";
import cors from "cors"; // Import the cors middleware
import bodyParser from "body-parser";
import server from "./config/server";
import router from "./routes/userRoutes";
import assignmentsRouter from "./routes/assignmentRoutes";
import commitsRouter from "./controllers/commitsRoutes";
import jobsRouter from "./routes/jobsRoutes";

const app = express();
const port = 3000;
// Enable CORS for all routes
app.use(cors());

app.use(bodyParser.json());
app.use("/api/user", router);
app.use("/api/assignments", assignmentsRouter);
app.use("/api/commits", commitsRouter);
app.use("/api/jobs", jobsRouter);

server(app, port);
export default app;
