import { Pool } from "pg";
import config from "../../../config/db";
import {
  AssignmentDataObject,
  AssignmentCreationObject,
} from "../domain/Assignment";

interface QueryResult {
  exists: boolean;
}


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

  public async executeTransaction(queries: { query: string; values?: any[] }[]): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      for (const { query, values } of queries) {
        await client.query(query, values);
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
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
      groupid: row.groupid,
    };
  }
  async checkDuplicateTitle(title: string, groupid: number): Promise<boolean> {
    const query = "SELECT EXISTS (SELECT 1 FROM assignments WHERE LOWER(title) = LOWER($1) AND groupid = $2)";
    const result: QueryResult[] = await this.executeQuery(query, [title, groupid]);
    return result[0].exists;
  }

  async obtainAssignments(): Promise<AssignmentDataObject[]> {
    const query =
      "SELECT id, title, description, start_date, end_date, state, link, comment, groupid FROM assignments";
    const rows = await this.executeQuery(query);
    return rows.map((row) => this.mapRowToAssignment(row));
  }
  async obtainAssignmentsByGroupId(
    groupid: number
  ): Promise<AssignmentDataObject[]> {
    const query = "SELECT * FROM assignments WHERE groupid = $1";
    const values = [groupid];
    const rows = await this.executeQuery(query, values);
    return rows.map((row) => this.mapRowToAssignment(row));
  }
  async obtainAssignmentById(id: string): Promise<AssignmentDataObject | null> {
    const query =
      "SELECT id, title, description, start_date, end_date, state, link, comment, groupid FROM assignments WHERE id = $1";
    const values = [id];
    const rows = await this.executeQuery(query, values);
    if (rows.length === 1) {
      return this.mapRowToAssignment(rows[0]);
    }
    return null;
  }

  async obtainAssignmentsByPracticeId(practiceId: string): Promise<AssignmentDataObject[]> {
    const query = "SELECT * FROM assignments WHERE practice_id = $1";
    const values = [practiceId];
    const rows = await this.executeQuery(query, values);
    return rows.map((row) => this.mapRowToAssignment(row));
  }

  async createAssignment(
    assignment: AssignmentCreationObject
  ): Promise<AssignmentCreationObject> {
    const { title, description, start_date, end_date, state, groupid } =
      assignment;
    const query =
      "INSERT INTO assignments (title, description, start_date, end_date, state, groupid) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *";
    const values = [title, description, start_date, end_date, state, groupid];
    const rows = await this.executeQuery(query, values);
    return this.mapRowToAssignment(rows[0]);
  }

  async deleteAssignment(assignmentId: number): Promise<void> {
    const client = await pool.connect();
    console.log("Eliminando assignment de BD, ID:", assignmentId);

    try {
      // 1. Intentar eliminar entregas relacionadas (si existen)
      try {
        await client.query('DELETE FROM submissions WHERE assignmentid = $1', [assignmentId]);
      } catch (error: any) {
        console.warn("Tabla submissions no existe, continuando...");
      }

      // 2. Intentar eliminar deliveries si existen
      try {
        await client.query('DELETE FROM deliveries WHERE assignmentid = $1', [assignmentId]);
      } catch (error: any) {
        console.warn("Tabla deliveries no existe, continuando...");
      }

      // 3. Finalmente eliminar el assignment
      await client.query('DELETE FROM assignments WHERE id = $1', [assignmentId]);

    } catch (error: any) {
      console.error("Error en deleteAssignment repository:", error);
      throw new Error(`Error en la base de datos: ${error.message}`);
    } finally {
      client.release();
    }
  }

  async deleteAssignmentsByPracticeId(practiceId: string): Promise<void> {
    const client = await pool.connect();
    try {
      console.log('Eliminando assignments por practice_id:', practiceId);

      const query = "DELETE FROM assignments WHERE practice_id = $1";
      const values = [practiceId];

      const result = await client.query(query, values);

      console.log('Delete by practice_id result rowCount:', result.rowCount);
    } catch (error: any) {
      console.error('Error en deleteAssignmentsByPracticeId:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async updateAssignment(
    id: string,
    updatedAssignment: AssignmentCreationObject
    ): Promise<AssignmentCreationObject | null> {
    const { title, description, start_date, end_date, state, link, comment, groupid } =
      updatedAssignment;
    const query =
      "UPDATE assignments SET title = $1, description = $2, start_date = $3, end_date = $4, state = $5, link = $6, comment = $7, groupid = $8 WHERE id = $9 RETURNING *";
    const values = [
      title,
      description,
      start_date,
      end_date,
      state,
      link,
      comment,
      groupid,
      id,
    ];
    const rows = await this.executeQuery(query, values);
    if (rows.length === 1) {
      return this.mapRowToAssignment(rows[0]);
    }
    return null;
  }

  async groupidExistsForAssigment(groupid: number): Promise<boolean> {
    const query = "SELECT EXISTS (SELECT 1 FROM groups WHERE id = $1)";
    const result: QueryResult[] = await this.executeQuery(query, [groupid]);
    return result[0].exists;
  }

}
  
export default AssignmentRepository;