// routes/tasks.js
const express = require("express");
const router = express.Router();
const tasksController = require("../controllers/tasksController");
const app = express();

app.get("/", (request, response) => {
  response.json({ info: "Node.js, Express, and Postgres API" });
});

router.get("/", tasksController.getAllTasks);

// Create a new task
router.post("/tasks", tasksController.createTask);

// Retrieve all tasks
router.get("/tasks", tasksController.getAllTasks);

// Retrieve a specific task by ID
router.get("/tasks:id", tasksController.getTaskById);

// Update a task by ID
router.put("/tasks:id", tasksController.updateTask);

// Delete a task by ID
router.delete("/tasks:id", tasksController.deleteTask);

module.exports = router;
