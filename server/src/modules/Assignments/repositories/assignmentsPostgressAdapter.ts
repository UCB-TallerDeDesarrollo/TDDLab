import { Pool } from "pg";
import config from "../../../config/db";
import { AssignmentDataObject } from "../domain/Assignment";
const pool = new Pool(config);

class AssignmentPostgresAdapter {
  async obtainAssignments(): Promise<AssignmentDataObject[]> {
    try {
      // Use a pool client to connect to the database
      const client = await pool.connect();

      // Query to retrieve all assignments from the 'assignments' table
      const query = "SELECT * FROM assignments";

      // Execute the query
      const result = await client.query(query);

      // Release the client back to the pool
      client.release();

      // Map the rows to assignment objects
      const assignments: AssignmentDataObject[] = result.rows.map(
        (row: any) => ({
          id: row.id,
          title: row.title,
          description: row.description,
          start_date: row.start_date,
          end_date: row.end_date,
          state: row.state,
        })
      );

      return assignments;
    } catch (error) {
      console.error("Error fetching assignments:", error);
      throw error;
    }
  }

  async obtainAssignmentById(id: string): Promise<AssignmentDataObject | null> {
    try {
      const client = await pool.connect();
      const query = "SELECT * FROM assignments WHERE id = $1";
      const values = [id];
      const result = await client.query(query, values);
      client.release();
      if (result.rows.length === 1) {
        const assignment: AssignmentDataObject = {
          title: result.rows[0].title,
          description: result.rows[0].description,
          start_date: result.rows[0].start_date,
          end_date: result.rows[0].end_date,
          state: result.rows[0].state,
        };
        return assignment;
      }
      return null;
    } catch (error) {
      console.error("Error fetching assignment by ID:", error);
      throw error;
    }
  }

  async createAssignment(
    assignment: AssignmentDataObject
  ): Promise<AssignmentDataObject> {
    try {
      const client = await pool.connect();
      const { title, description, start_date, end_date, state } = assignment;
      const query =
        "INSERT INTO assignments (title, description, start_date, end_date, state) VALUES ($1, $2, $3, $4, $5) RETURNING *";
      const values = [title, description, start_date, end_date, state];
      const result = await client.query(query, values);
      client.release();
      return result.rows[0] as AssignmentDataObject;
    } catch (error) {
      console.error("Error adding assignment:", error);
      throw error;
    }
  }

  async deleteAssignment(id: string): Promise<void> {
    try {
      const client = await pool.connect();
      const query = "DELETE FROM assignments WHERE id = $1";
      const values = [id];
      await client.query(query, values);
      client.release();
    } catch (error) {
      console.error("Error deleting assignment:", error);
      throw error;
    }
  }

  async updateAssignment(
    id: number,
    updatedAssignment: AssignmentDataObject
  ): Promise<AssignmentDataObject | null> {
    try {
      const client = await pool.connect();
      const { title, description, start_date, end_date, state } =
        updatedAssignment;
      const query =
        "UPDATE assignments SET title = $1, description = $2, start_date = $3, end_date = $4, state = $5 WHERE id = $6 RETURNING *";
      const values = [title, description, start_date, end_date, state, id];
      const result = await client.query(query, values);
      client.release();
      if (result.rows.length === 1) {
        const assignment: AssignmentDataObject = {
          title: result.rows[0].title,
          description: result.rows[0].description,
          start_date: result.rows[0].start_date,
          end_date: result.rows[0].end_date,
          state: result.rows[0].state,
        };
        return assignment;
      }
      return null;
    } catch (error) {
      console.error("Error updating assignment:", error);
      throw error;
    }
  }
}

export default AssignmentPostgresAdapter;
