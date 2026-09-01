import { IDatabaseConnection, IDatabaseConnectionFactory } from "../../Shared/Domain/IDatabaseConnectionFactory";
import { PracticeSubmissionsSchema } from "../Domain/Schema/PracticeSubmissions";
import { PracticeSubmissionsOptions } from "../Domain/Schema/Options/PracticeSubmissionsOptions";
import { queryBuilderFactory } from "../../Shared/Infrastructure/QueryBuilder/QueryBuilderFactory";
import { IPracticeSubmissionRepository } from "../Domain/IPracticeSubmissionRepository";
import { PracticeSubmissionCreationObject, PracticeSubmissionDataObject, PracticeSubmissionUpdateObject } from "../Domain/PracticeSubmission";

export class PracticeSubmissionRepositoryBuilder implements IPracticeSubmissionRepository {
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

  private mapRowToPracticeSubmission(row: any): PracticeSubmissionDataObject {
    return {
      id: row.id,
      practiceid: row.practiceid,
      userid: row.userid,
      status: row.status,
      repository_link: row.repository_link,
      start_date: row.start_date,
      end_date: row.end_date,
      comment: row.comment,
    };
  }

  async CreatePracticeSubmission(practiceSubmission: PracticeSubmissionCreationObject): Promise<PracticeSubmissionDataObject> {
    const connection = await this.connectionFactory.getConnection();
    try {
      const { query, params } = queryBuilderFactory
        .create(PracticeSubmissionsSchema)
        .insert(practiceSubmission)
        .returning()
        .build();

      const result = await connection.query(query, params);
      return this.mapRowToPracticeSubmission(result.rows[0]);
    } finally {
      connection.release();
    }
  }

  async ObtainPracticeSubmissions(): Promise<PracticeSubmissionDataObject[]> {
    const { query, params } = queryBuilderFactory
      .create(PracticeSubmissionsSchema)
      .select()
      .build();

    const rows = await this.executeQuery(query, params);
    return rows.map((row) => this.mapRowToPracticeSubmission(row));
  }

  async UpdatePracticeSubmission(id: number, updatedSubmission: PracticeSubmissionUpdateObject): Promise<PracticeSubmissionUpdateObject | null> {
    const connection = await this.connectionFactory.getConnection();
    try {
      const { query, params } = queryBuilderFactory
        .create(PracticeSubmissionsSchema)
        .update(updatedSubmission)
        .where(new PracticeSubmissionsOptions().byId(id))
        .returning()
        .build();

      const result = await connection.query(query, params);
      if (result.rows.length === 1) {
        return this.mapRowToPracticeSubmission(result.rows[0]) as PracticeSubmissionUpdateObject;
      }
      return null;
    } finally {
      connection.release();
    }
  }

  async deletePracticeSubmission(id: number): Promise<void> {
    const { query, params } = queryBuilderFactory
      .create(PracticeSubmissionsSchema)
      .delete()
      .where(new PracticeSubmissionsOptions().byId(id))
      .build();

    await this.executeQuery(query, params);
  }

  async practiceidExistsForPracticeSubmission(practiceid: number): Promise<boolean> {
    const query = "SELECT EXISTS (SELECT 1 FROM practices WHERE id = $1)";
    const result = await this.executeQuery(query, [practiceid]);
    return result[0].exists;
  }

  async useridExistsForPracticeSubmission(userid: number): Promise<boolean> {
    const query = "SELECT EXISTS (SELECT 1 FROM userstable WHERE id = $1)";
    const result = await this.executeQuery(query, [userid]);
    return result.length > 0;
  }

  async getPracticeSubmissionByPracticeAndUser(practiceid: number, userid: number): Promise<PracticeSubmissionDataObject | null> {
    const options = new PracticeSubmissionsOptions()
      .byPracticeId(practiceid)
      .byUserId(userid);

    const { query, params } = queryBuilderFactory
      .create(PracticeSubmissionsSchema)
      .select()
      .where(options)
      .build();

    const rows = await this.executeQuery(query, params);
    if (rows.length > 0) {
      return this.mapRowToPracticeSubmission(rows[0]);
    }
    return null;
  }

  async getPracticeSubmissionsByPracticeId(practiceid: number): Promise<PracticeSubmissionDataObject[]> {
    const { query, params } = queryBuilderFactory
      .create(PracticeSubmissionsSchema)
      .select()
      .where(new PracticeSubmissionsOptions().byPracticeId(practiceid))
      .build();

    const rows = await this.executeQuery(query, params);
    return rows.map((row) => this.mapRowToPracticeSubmission(row));
  }
}
