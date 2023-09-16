// controllers/tasksController.js
const db = require("../../db"); // Import your database connection
const { validationResult } = require("express-validator");

const Task = require("../../domain/entities/Task"); // Import your Task entity
const taskUseCases = require("../../domain/useCases/taskUseCases"); // Import your task use cases

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, start_date, end_date, state } = req.body;

    // Validate input data (you can use express-validator here)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Create a Task entity
    const newTask = new Task({
      title,
      description,
      start_date,
      end_date,
      state,
    });

    // Call the use case to create the task
    const createdTask = await taskUseCases.createTask(newTask);

    // Return the created task as JSON response
    res.status(201).json(createdTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Retrieve all tasks
exports.getAllTasks = async (req, res) => {
  try {
    // Call the use case to retrieve all tasks
    const tasks = await taskUseCases.getAllTasks();

    // Return the tasks as a JSON response
    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Retrieve a specific task by ID
exports.getTaskById = async (req, res) => {
  try {
    const taskId = req.params.id;

    // Call the use case to retrieve a task by ID
    const task = await taskUseCases.getTaskById(taskId);

    // Check if the task exists
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Return the task as a JSON response
    res.status(200).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update a task by ID
exports.updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { title, description, start_date, end_date, state } = req.body;

    // Validate input data (you can use express-validator here)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Create a Task entity with updated data
    const updatedTask = new Task({
      title,
      description,
      start_date,
      end_date,
      state,
    });

    // Call the use case to update the task by ID
    const result = await taskUseCases.updateTask(taskId, updatedTask);

    // Check if the task was updated successfully
    if (!result) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Return a success message as a JSON response
    res.status(200).json({ message: "Task updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete a task by ID
exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    // Call the use case to delete the task by ID
    const result = await taskUseCases.deleteTask(taskId);

    // Check if the task was deleted successfully
    if (!result) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Return a success message as a JSON response
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
