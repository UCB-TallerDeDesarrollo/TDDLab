import { Pool } from "pg"; 
import config from "../../../config/db";
import { TeacherComment } from "../Domain/TeacherComment";

export class TeacherCommentRepository {
  pool: Pool;
  
  constructor() {
    this.pool = new Pool(config);
  }

  public async executeQuery(query: string, values?: any[]): Promise<any[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(query, values);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async createTeacherComment(comment: Omit<TeacherComment, 'id' | 'created_at'>) {
    const client = await this.pool.connect();
    try {
      const query = `INSERT INTO TeacherComments (submission_id, teacher_id, content) 
                     VALUES ($1, $2, $3) RETURNING *`;
      const values = [comment.submission_id, comment.teacher_id, comment.content];

      const result = await client.query(query, values);
      return result.rows[0]; 
    } catch (error) {
      console.error("Error inserting teacher comment:", error);
      throw new Error("Database error"); 
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  async getTeacherCommentsBySubmission(submission_id: number): Promise<TeacherComment[]> {
    const query = "SELECT * FROM TeacherComments WHERE submission_id = $1";
    const values = [submission_id];
    const rows = await this.executeQuery(query, values);
    return rows;
  }

  async isTeacher(teacher_id: number): Promise<boolean> {
    const query = "SELECT 1 FROM userstable WHERE id = $1 AND role <> $2";
    const values = [teacher_id, 'student'];
    const result = await this.executeQuery(query, values);
    return result.length > 0;
  }

  async submissionExists(submission_id: number): Promise<boolean> {
    const query = "SELECT 1 FROM submissions WHERE id = $1";
    const values = [submission_id];
    const result = await this.executeQuery(query, values);
    return result.length > 0;
  }
}
