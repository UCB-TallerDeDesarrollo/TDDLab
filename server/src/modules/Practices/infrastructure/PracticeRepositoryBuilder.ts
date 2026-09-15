import { IDatabaseConnection, IDatabaseConnectionFactory } from "../../Shared/Domain/IDatabaseConnectionFactory";
import { PracticesSchema } from "../domain/Schema/Practices";
import { PracticesOptions } from "../domain/Schema/Options/PracticesOptions";
import { queryBuilderFactory } from "../../Shared/Infrastructure/QueryBuilder/QueryBuilderFactory";
import { IPracticeRepository } from "../domain/IPracticeRepository";
import { PracticeDataObject, PracticeCreationObject } from "../domain/Practice";

export class PracticeRepositoryBuilder implements IPracticeRepository {
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

  private mapRowToPractice(row: any): PracticeDataObject {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      creation_date: row.creation_date,
      state: row.state,
      userid: row.userid,
    };
  }

  async obtainPractices(): Promise<PracticeDataObject[]> {
    const { query, params } = queryBuilderFactory
      .create(PracticesSchema)
      .select()
      .build();

    const rows = await this.executeQuery(query, params);
    return rows.map((row) => this.mapRowToPractice(row));
  }

  async obtainPracticeById(id: string): Promise<PracticeDataObject | null> {
    const { query, params } = queryBuilderFactory
      .create(PracticesSchema)
      .select()
      .where(new PracticesOptions().byId(id))
      .limit(1)
      .build();

    const rows = await this.executeQuery(query, params);
    if (rows.length === 1) {
      return this.mapRowToPractice(rows[0]);
    }
    return null;
  }

  async obtainPracticesByUserId(userid: string): Promise<PracticeDataObject[]> {
    const { query, params } = queryBuilderFactory
      .create(PracticesSchema)
      .select()
      .where(new PracticesOptions().byUserId(Number(userid)))
      .build();

    const rows = await this.executeQuery(query, params);
    return rows.map((row) => this.mapRowToPractice(row));
  }

  async createPractice(practice: PracticeCreationObject): Promise<PracticeCreationObject> {
    const { query, params } = queryBuilderFactory
      .create(PracticesSchema)
      .insert(practice)
      .returning()
      .build();

    const rows = await this.executeQuery(query, params);
    return this.mapRowToPractice(rows[0]);
  }

  async deletePractice(id: string): Promise<void> {
    const { query, params } = queryBuilderFactory
      .create(PracticesSchema)
      .delete()
      .where(new PracticesOptions().byId(id))
      .build();

    await this.executeQuery(query, params);
  }

  async updatePractice(id: string, updatedPractice: PracticeCreationObject): Promise<PracticeCreationObject | null> {
    const { query, params } = queryBuilderFactory
      .create(PracticesSchema)
      .update(updatedPractice)
      .where(new PracticesOptions().byId(id))
      .returning()
      .build();

    const rows = await this.executeQuery(query, params);
    if (rows.length === 1) {
      return this.mapRowToPractice(rows[0]);
    }
    return null;
  }
}
