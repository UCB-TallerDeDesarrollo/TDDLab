// src/adapters/controllers/assignments/assignmentController.ts

import { Request, Response } from 'express';
import { Pool } from 'pg'; // Import the Pool from 'pg'
import config from '../../../config/db'; // Import your database configuration

const pool = new Pool(config);

export const getAssignments = async (_req: Request, res: Response) => {
  try {
    // Use a pool client to connect to the database
    const client = await pool.connect();

    // Query to retrieve all assignments from the 'assignments' table
    const query = 'SELECT * FROM assignments';

    // Execute the query
    const result = await client.query(query);

    // Release the client back to the pool
    client.release();

    // Respond with the fetched assignments as JSON
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


export const createAssignment = (_req: Request, _res: Response) => {

  // Create assignment logic (use your repository or ORM here)
  // Respond with the created assignment as JSON
};
