import { IDatabaseConnection, IDatabaseConnectionFactory } from "../../Shared/Domain/IDatabaseConnectionFactory";
import { AssignmentsSchema } from "../domain/Schema/Assignments";
import { AssignmentsOptions } from "../domain/Schema/Options/AssignmentsOptions";
import { queryBuilderFactory } from "../../Shared/Infrastructure/QueryBuilder/QueryBuilderFactory";
import { IAssignmentRepository } from "../domain/IAssignmentRepository";
import { AssignmentDataObject, AssignmentCreationObject } from "../domain/Assignment";

export class AssignmentRepositoryBuilder implements IAssignmentRepository {
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

  private async executeTransaction(queries: { query: string; values?: any[] }[]): Promise<void> {
    const connection: IDatabaseConnection = await this.connectionFactory.getConnection();
    try {
      await connection.query('BEGIN');
      for (const { query, values } of queries) {
        await connection.query(query, values);
      }
      await connection.query('COMMIT');
    } catch (error) {
      await connection.query('ROLLBACK');
      throw error;
    } finally {
      connection.release();
    }
  }

  private mapRowToAssignment(row: any): AssignmentDataObject {
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
    const result = await this.executeQuery(query, [title, groupid]);
    return result[0].exists;
  }

  async obtainAssignments(): Promise<AssignmentDataObject[]> {
    const { query, params } = queryBuilderFactory
      .create(AssignmentsSchema)
      .select()
      .build();

    const rows = await this.executeQuery(query, params);
    return rows.map((row) => this.mapRowToAssignment(row));
  }

  async obtainAssignmentsByGroupId(groupid: number): Promise<AssignmentDataObject[]> {
    const { query, params } = queryBuilderFactory
      .create(AssignmentsSchema)
      .select()
      .where(new AssignmentsOptions().byGroupId(groupid))
      .build();

    const rows = await this.executeQuery(query, params);
    return rows.map((row) => this.mapRowToAssignment(row));
  }

  async obtainAssignmentById(id: string): Promise<AssignmentDataObject | null> {
    const { query, params } = queryBuilderFactory
      .create(AssignmentsSchema)
      .select()
      .where(new AssignmentsOptions().byId(id))
      .limit(1)
      .build();

    const rows = await this.executeQuery(query, params);
    if (rows.length === 1) {
      return this.mapRowToAssignment(rows[0]);
    }
    return null;
  }

  async obtainAssignmentsByPracticeId(practiceId: string): Promise<AssignmentDataObject[]> {
    const { query, params } = queryBuilderFactory
      .create(AssignmentsSchema)
      .select()
      .where(new AssignmentsOptions().byPracticeId(practiceId))
      .build();

    const rows = await this.executeQuery(query, params);
    return rows.map((row) => this.mapRowToAssignment(row));
  }

  async createAssignment(assignment: AssignmentCreationObject): Promise<AssignmentCreationObject> {
    const { query, params } = queryBuilderFactory
      .create(AssignmentsSchema)
      .insert(assignment)
      .returning()
      .build();

    const rows = await this.executeQuery(query, params);
    return this.mapRowToAssignment(rows[0]);
  }

  async deleteAssignment(assignmentId: number): Promise<void> {
    await this.executeTransaction([
      { query: 'DELETE FROM submissions WHERE assignmentid = $1', values: [assignmentId] },
      { query: 'DELETE FROM deliveries WHERE assignmentid = $1', values: [assignmentId] },
      { query: 'DELETE FROM assignments WHERE id = $1', values: [assignmentId] },
    ]);
  }

  async deleteAssignmentsByPracticeId(practiceId: string): Promise<void> {
    const { query, params } = queryBuilderFactory
      .create(AssignmentsSchema)
      .delete()
      .where(new AssignmentsOptions().byPracticeId(practiceId))
      .build();

    await this.executeQuery(query, params);
  }

  async updateAssignment(id: string, updatedAssignment: AssignmentCreationObject): Promise<AssignmentCreationObject | null> {
    const { query, params } = queryBuilderFactory
      .create(AssignmentsSchema)
      .update(updatedAssignment)
      .where(new AssignmentsOptions().byId(id))
      .returning()
      .build();

    const rows = await this.executeQuery(query, params);
    if (rows.length === 1) {
      return this.mapRowToAssignment(rows[0]);
    }
    return null;
  }

  async groupidExistsForAssigment(groupid: number): Promise<boolean> {
    const query = "SELECT EXISTS (SELECT 1 FROM groups WHERE id = $1)";
    const result = await this.executeQuery(query, [groupid]);
    return result[0].exists;
  }
}
