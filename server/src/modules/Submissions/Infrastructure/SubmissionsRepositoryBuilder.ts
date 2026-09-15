import { IDatabaseConnection, IDatabaseConnectionFactory } from "../../Shared/Domain/IDatabaseConnectionFactory";
import { SubmissionsSchema } from "../Domain/Schema/Submissions";
import { SubmissionsOptions } from "../Domain/Schema/Options/SubmissionsOptions";
import { queryBuilderFactory } from "../../Shared/Infrastructure/QueryBuilder/QueryBuilderFactory";
import { ISubmissionsRepository } from "../Domain/ISubmissionsRepository";
import { SubmissionCreationObject, SubmissionDataObject, SubmissionUpdateObject } from "../Domain/Submission";

export class SubmissionsRepositoryBuilder implements ISubmissionsRepository {
  constructor(private connectionFactory: IDatabaseConnectionFactory) {}

  private async executeQuery(query: string, values?: any[]): Promise<any[]> {
    const connection: IDatabaseConnection = await this.connectionFactory.getConnection();
    try {
      const result = await connection.query(query, values);
      return result.rows;
    } finally {
      connection.release();
    }
  }

  private mapRowToSubmission(row: any): SubmissionDataObject {
    return {
      id: row.id,
      assignmentid: row.assignmentid,
      userid: row.userid,
      status: row.status,
      repository_link: row.repository_link,
      start_date: row.start_date,
      end_date: row.end_date,
      comment: row.comment,
    };
  }

  async CreateSubmission(submission: SubmissionCreationObject): Promise<SubmissionDataObject> {
    const connection = await this.connectionFactory.getConnection();
    try {
      const { query, params } = queryBuilderFactory
        .create(SubmissionsSchema)
        .insert(submission)
        .returning()
        .build();

      const result = await connection.query(query, params);
      return this.mapRowToSubmission(result.rows[0]);
    } finally {
      connection.release();
    }
  }

  async ObtainSubmissions(): Promise<SubmissionDataObject[]> {
    const { query, params } = queryBuilderFactory
      .create(SubmissionsSchema)
      .select()
      .build();

    const rows = await this.executeQuery(query, params);
    return rows.map((row) => this.mapRowToSubmission(row));
  }

  async UpdateSubmission(id: number, updatedSubmission: SubmissionUpdateObject): Promise<SubmissionUpdateObject | null> {
    const connection = await this.connectionFactory.getConnection();
    try {
      const { query, params } = queryBuilderFactory
        .create(SubmissionsSchema)
        .update(updatedSubmission)
        .where(new SubmissionsOptions().byId(id))
        .returning()
        .build();

      const result = await connection.query(query, params);
      if (result.rows.length === 1) {
        return this.mapRowToSubmission(result.rows[0]) as SubmissionUpdateObject;
      }
      return null;
    } finally {
      connection.release();
    }
  }

  async deleteSubmission(id: number): Promise<void> {
    const { query, params } = queryBuilderFactory
      .create(SubmissionsSchema)
      .delete()
      .where(new SubmissionsOptions().byId(id))
      .build();

    await this.executeQuery(query, params);
  }

  async assignmentidExistsForSubmission(assignmentid: number): Promise<boolean> {
    const query = "SELECT EXISTS (SELECT 1 FROM assignments WHERE id = $1)";
    const result = await this.executeQuery(query, [assignmentid]);
    return result[0].exists;
  }

  async useridExistsForSubmission(userid: number): Promise<boolean> {
    const query = "SELECT EXISTS (SELECT 1 FROM userstable WHERE id = $1)";
    const result = await this.executeQuery(query, [userid]);
    return result.length > 0;
  }

  async getSubmissionByAssignmentAndUser(assignmentid: number, userid: number): Promise<SubmissionDataObject | null> {
    const options = new SubmissionsOptions()
      .byAssignmentId(assignmentid)
      .byUserId(userid);

    const { query, params } = queryBuilderFactory
      .create(SubmissionsSchema)
      .select()
      .where(options)
      .build();

    const rows = await this.executeQuery(query, params);
    if (rows.length > 0) {
      return this.mapRowToSubmission(rows[0]);
    }
    return null;
  }

  async getSubmissionsByAssignmentId(assignmentid: number): Promise<SubmissionDataObject[] | null> {
    const { query, params } = queryBuilderFactory
      .create(SubmissionsSchema)
      .select()
      .where(new SubmissionsOptions().byAssignmentId(assignmentid))
      .build();

    const rows = await this.executeQuery(query, params);
    return rows.map((row) => this.mapRowToSubmission(row));
  }
}
