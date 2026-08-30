import { TeacherComment } from "../Domain/TeacherComment";
import { ITeacherCommentRepository } from "../Domain/ITeacherCommentRepository";
import { IDatabaseConnection, IDatabaseConnectionFactory } from "../../Shared/Domain/IDatabaseConnectionFactory";
import { TeacherCommentsOptions } from "../../Shared/Domain/Schema/Options/TeacherCommentsOptions";
import { queryBuilderFactory } from "../../Shared/Infrastructure/QueryBuilder/QueryBuilderFactory";
import { TeacherCommentsSchema } from "../../Shared/Domain/Schema/TeacherComments";

export class PostgresTeacherCommentRepository implements ITeacherCommentRepository {
  constructor(private connectionFactory: IDatabaseConnectionFactory) {
  }

  private async executeQuery(query: string, values?: any[]): Promise<any[]> {
    const connection: IDatabaseConnection = await this.connectionFactory.getConnection();
    try {
      const result = await connection.query(query, values);
      return result.rows;
    } finally {
      connection.release();
    }
  }

  async createTeacherComment(comment: Omit<TeacherComment, 'id' | 'created_at'>): Promise<TeacherComment> {
    const connection = await this.connectionFactory.getConnection();
    try {
      const options = new TeacherCommentsOptions()
        .bySubmissionId(comment.submission_id)
        .byTeacherId(comment.teacher_id);
      const { query, params } = queryBuilderFactory
        .create(TeacherCommentsSchema)
        .insert(comment)
        .where(options)
        .build();

      const result = await connection.query(query, params);
      return result.rows[0];
    } catch (error) {
      console.error("Error inserting teacher comment:", error);
      throw new Error("Database error");
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  async getTeacherCommentsBySubmission(submission_id: number): Promise<TeacherComment[]> {
    const options = new TeacherCommentsOptions()
      .bySubmissionId(submission_id);
    const { query, params } = queryBuilderFactory
      .create(TeacherCommentsSchema)
      .where(options)
      .build();
    const rows = await this.executeQuery(query, params);
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
