import { Pool } from "pg";
import config from "../../../config/db";
import {
  AssignmentDataObject,
  AssignmentCreationObject,
} from "../domain/Assignment";

const pool = new Pool(config);

class AssignmentRepository {
 
  public async executeQuery(query: string, values?: any[]): Promise<any[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(query, values);
      return result.rows;
    } finally {
      client.release();
    }
  }

  public mapRowToAssignment(row: any): AssignmentDataObject {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      start_date: row.start_date,
      end_date: row.end_date,
      state: row.state,
      link: row.link,
      comment: row.comment,
      groupId: row.groupid
    };
  }

  async obtainAssignments(): Promise<AssignmentDataObject[]> {
    const query =
      "SELECT id, title, description, start_date, end_date, state, link, comment, groupid FROM assignments";
    const rows = await this.executeQuery(query);
    return rows.map((row) => this.mapRowToAssignment(row));
  }
  async obtainAssignmentsByGroupId(groupId: number): Promise<AssignmentDataObject[]> {
    const query = "SELECT * FROM assignments WHERE groupid = $1";
    const values =[groupId];
    const rows = await this.executeQuery(query,values)
    return rows.map((row) => this.mapRowToAssignment(row)); 
  }
  async obtainAssignmentById(id: string): Promise<AssignmentDataObject | null> {
    const query = "SELECT * FROM assignments WHERE id = $1";
    const values = [id];
    const rows = await this.executeQuery(query, values);
    if (rows.length === 1) {
      return this.mapRowToAssignment(rows[0]);
    }
    return null;
  }

  async createAssignment(
    assignment: AssignmentCreationObject
  ): Promise<AssignmentCreationObject> {
    const { title, description, start_date, end_date, state, groupId } = assignment;
    const query =
      "INSERT INTO assignments (title, description, start_date, end_date, state, groupid) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *";
    const values = [title, description, start_date, end_date, state, groupId];
    const rows = await this.executeQuery(query, values);
    return this.mapRowToAssignment(rows[0]);
  }

  async deleteAssignment(id: string): Promise<void> {
    const query = "DELETE FROM assignments WHERE id = $1";
    const values = [id];
    await this.executeQuery(query, values);
  }

  async updateAssignment(
    id: string,
    updatedAssignment: AssignmentCreationObject
  ): Promise<AssignmentCreationObject | null> {
    const { title, description, start_date, end_date, state, link, comment } =
      updatedAssignment;
    const query =
      "UPDATE assignments SET title = $1, description = $2, start_date = $3, end_date = $4, state = $5, link = $6, comment = $7 WHERE id = $8 RETURNING *";
    const values = [
      title,
      description,
      start_date,
      end_date,
      state,
      link,
      comment,
      id,
    ];
    const rows = await this.executeQuery(query, values);
    if (rows.length === 1) {
      return this.mapRowToAssignment(rows[0]);
    }
    return null;
  }
}

export default AssignmentRepository;
