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

export const getAssignmentById = async (_req: Request, res: Response) => {
  try {
    // Use a pool client to connect to the database
    const client = await pool.connect();

    // Query to retrieve all assignments from the 'assignments' table
    const query = 'SELECT * FROM assignments WHERE id = $1';
    const values = [_req.params.id];

    // Execute the query
    const result = await client.query(query, values);

    // Release the client back to the pool
    client.release();

    // Respond with the fetched assignments as JSON
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

export const createAssignment = async (_req: Request, _res: Response) => {
  try{
    const {title, description, state} = _req.body; 
    // use date format "2023-09-23T12:00:00.000Z" on postman, thunderclient or others.
    const  start_date = new Date(_req.body.start_date)
    const  end_date = new Date(_req.body.end_date)
     // Use a pool client to connect to the database
    const client = await pool.connect();

     // Query to retrieve all assignments from the 'assignments' table
     const query = 'INSERT INTO assignments (title, description, start_date, end_date, state) VALUES ($1, $2, $3, $4, $5)';
     const values = [title, description, start_date, end_date, state]

    // Execute the query
    const result = await client.query(query, values);

    // Release the client back to the pool
    client.release();

    // Respond with the fetched assignments as JSON
    _res.status(201).json(result.rows);
  } catch (error) {
    console.error('Error adding assignments:', error);
    _res.status(500).json({ error: 'Server error' });
  }
};
