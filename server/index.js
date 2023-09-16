const express = require("express");
const app = express();
//const { Pool } = require("./src/db");
const cors = require("cors");
// Middleware setup (body parser, CORS, etc.)
app.use(express.json()); // for parsing JSON data
app.use(cors()); // if needed

// Routes setup (assuming you have task routes)
const taskRoutes = require("./src/application/routes/taskRoutes");
app.use("/tasks", taskRoutes);

// Error handling middleware (customize as needed)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
