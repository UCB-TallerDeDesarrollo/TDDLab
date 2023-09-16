const { Pool } = require("pg");

// Create a PostgreSQL connection pool
const pool = new Pool({
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

// Create a new task
async function create(task) {
  const query = `
    INSERT INTO tasks (title, description, start_date, end_date, state)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  const values = [
    task.title,
    task.description,
    task.start_date,
    task.end_date,
    task.state,
  ];

  const client = await pool.connect();
  try {
    const result = await client.query(query, values);
    return result.rows[0];
  } finally {
    client.release();
  }
}

// Retrieve all tasks
async function getAll() {
  const query = "SELECT * FROM tasks;";

  const client = await pool.connect();
  try {
    const result = await client.query(query);
    return result.rows;
  } finally {
    client.release();
  }
}

// Retrieve a specific task by ID
async function getById(id) {
  const query = "SELECT * FROM tasks WHERE id = $1;";
  const values = [id];

  const client = await pool.connect();
  try {
    const result = await client.query(query, values);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// Update a task by ID
async function update(id, updatedTask) {
  const query = `
    UPDATE tasks
    SET title = $2, description = $3, start_date = $4, end_date = $5, state = $6
    WHERE id = $1
    RETURNING *;
  `;

  const values = [
    id,
    updatedTask.title,
    updatedTask.description,
    updatedTask.start_date,
    updatedTask.end_date,
    updatedTask.state,
  ];

  const client = await pool.connect();
  try {
    const result = await client.query(query, values);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// Delete a task by ID
async function deleteTask(id) {
  const query = "DELETE FROM tasks WHERE id = $1;";
  const values = [id];

  const client = await pool.connect();
  try {
    await client.query(query, values);
    return true; // Deletion was successful
  } catch (error) {
    return false; // Task with the given ID was not found
  } finally {
    client.release();
  }
}

module.exports = {
  create,
  getAll,
  getById,
  update,
  deleteTask,
};
