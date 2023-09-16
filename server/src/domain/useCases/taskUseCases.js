const Task = require("../entities/Task"); // Import the Task entity
const tasksRepository = require("../../repositories/taskRepository"); // Import the repository for tasks

// Create a new task
async function createTask(taskData) {
  try {
    // Create a new Task instance
    const task = new Task(taskData);

    // Save the task to the database
    const createdTask = await tasksRepository.create(task);

    return createdTask;
  } catch (error) {
    throw error;
  }
}

// Retrieve all tasks
async function getAllTasks() {
  try {
    // Retrieve all tasks from the database
    const tasks = await tasksRepository.getAll();

    return tasks;
  } catch (error) {
    throw error;
  }
}

// Retrieve a specific task by ID
async function getTaskById(taskId) {
  try {
    // Retrieve a task by ID from the database
    const task = await tasksRepository.getById(taskId);

    return task;
  } catch (error) {
    throw error;
  }
}

// Update a task by ID
async function updateTask(taskId, updatedTaskData) {
  try {
    // Update the task in the database
    const updatedTask = await tasksRepository.update(taskId, updatedTaskData);

    return updatedTask;
  } catch (error) {
    throw error;
  }
}

// Delete a task by ID
async function deleteTask(taskId) {
  try {
    // Delete the task from the database
    const result = await tasksRepository.delete(taskId);

    return result;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
