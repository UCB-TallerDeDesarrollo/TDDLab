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
      throw error; // Rethrow the error to be handled by the caller
    }
  }
}

export default AssignmentPostgresAdapter;
