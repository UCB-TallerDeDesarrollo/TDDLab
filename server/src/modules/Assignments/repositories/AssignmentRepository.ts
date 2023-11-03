import { Pool, QueryResultRow } from "pg";
import config from "../../../config/db";
import { AssignmentDataObject } from "../domain/Assignment";

const pool = new Pool(config);

class AssignmentRepository {
  private database: {
    executeQuery: (query: string, values?: any[]) => Promise<any[]>;
    mapAssignment: (row: QueryResultRow) => AssignmentDataObject;
  };

  constructor(database: {
    executeQuery: (query: string, values?: any[]) => Promise<any[]>;
    mapAssignment: (row: QueryResultRow) => AssignmentDataObject;
  }) {
    this.database = database;
  }

  async obtainAssignments(): Promise<AssignmentDataObject[]> {
    try {
      const query = "SELECT * FROM assignments";
      const rows = await this.database.executeQuery(query);
      return rows.map(this.database.mapAssignment);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      throw error;
    }
  }

  async obtainAssignmentById(id: string): Promise<AssignmentDataObject | null> {
    try {
      const query = "SELECT * FROM assignments WHERE id = $1";
      const values = [id];
      const rows = await this.database.executeQuery(query, values);
      return rows.length === 1 ? this.database.mapAssignment(rows[0]) : null;
    } catch (error) {
      console.error("Error fetching assignment by ID:", error);
      throw error;
    }
  }

  async createAssignment(
    assignment: AssignmentDataObject
  ): Promise<AssignmentDataObject> {
    try {
      const { title, description, start_date, end_date, state } = assignment;
      const query =
        "INSERT INTO assignments (title, description, start_date, end_date, state) VALUES ($1, $2, $3, $4, $5) RETURNING *";
      const values = [title, description, start_date, end_date, state];
      const rows = await this.database.executeQuery(query, values);
      return this.database.mapAssignment(rows[0]);
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
    id: string,
    updatedAssignment: AssignmentDataObject
  ): Promise<AssignmentDataObject | null> {
    try {
      const client = await pool.connect();
      const { title, description, start_date, end_date, state, link } =
        updatedAssignment;
      const query =
        "UPDATE assignments SET title = $1, description = $2, start_date = $3, end_date = $4, state = $5, link = $6 WHERE id = $7 RETURNING *";
      const values = [
        title,
        description,
        start_date,
        end_date,
        state,
        link,
        id,
      ];
      const result = await client.query(query, values);
      client.release();
      if (result.rows.length === 1) {
        const assignment: AssignmentDataObject = {
          title: result.rows[0].title,
          description: result.rows[0].description,
          start_date: result.rows[0].start_date,
          end_date: result.rows[0].end_date,
          state: result.rows[0].state,
          link: result.rows[0].link,
          comment: result.rows[0].comment,
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

export default AssignmentRepository;
