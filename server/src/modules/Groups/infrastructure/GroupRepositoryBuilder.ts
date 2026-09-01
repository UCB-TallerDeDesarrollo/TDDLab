import { IDatabaseConnection, IDatabaseConnectionFactory } from "../../Shared/Domain/IDatabaseConnectionFactory";
import { GroupsSchema } from "../domain/Schema/Groups";
import { GroupsOptions } from "../domain/Schema/Options/GroupsOptions";
import { queryBuilderFactory } from "../../Shared/Infrastructure/QueryBuilder/QueryBuilderFactory";
import { IGroupRepository } from "../domain/IGroupRepository";
import { GroupDataObject, GroupCreationObject, GroupUpdateObject } from "../domain/Group";

export class GroupRepositoryBuilder implements IGroupRepository {
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

  private mapRowToGroup(row: any): GroupDataObject {
    return {
      id: row.id,
      groupName: row.groupname,
      groupDetail: row.groupdetail,
      creationDate: row.creationdate,
    };
  }

  async obtainGroups(): Promise<GroupDataObject[]> {
    const { query, params } = queryBuilderFactory
      .create(GroupsSchema)
      .select()
      .build();

    const rows = await this.executeQuery(query, params);
    return rows.map((row) => this.mapRowToGroup(row));
  }

  async obtainGroupById(id: number): Promise<GroupDataObject | null> {
    const { query, params } = queryBuilderFactory
      .create(GroupsSchema)
      .select()
      .where(new GroupsOptions().byId(id))
      .limit(1)
      .build();

    const rows = await this.executeQuery(query, params);
    if (rows.length === 1) {
      return this.mapRowToGroup(rows[0]);
    }
    return null;
  }

  async checkGroupExists(groupid: number): Promise<boolean> {
    const query = "SELECT EXISTS (SELECT 1 FROM groups WHERE id = $1)";
    const result = await this.executeQuery(query, [groupid]);
    return result[0].exists;
  }

  async createGroup(group: GroupCreationObject): Promise<GroupDataObject> {
    const { query, params } = queryBuilderFactory
      .create(GroupsSchema)
      .insert(group)
      .build();

    const rows = await this.executeQuery(query, params);
    return this.mapRowToGroup(rows[0]);
  }

  async deleteGroup(id: number): Promise<void> {
    await this.executeTransaction([
      { query: 'DELETE FROM assignments WHERE groupid = $1', values: [id] },
      { query: 'DELETE FROM groups WHERE id = $1', values: [id] },
    ]);
  }

  async updateGroup(id: number, updatedGroup: GroupUpdateObject): Promise<GroupDataObject | null> {
    const { query, params } = queryBuilderFactory
      .create(GroupsSchema)
      .update(updatedGroup)
      .where(new GroupsOptions().byId(id))
      .build();

    const rows = await this.executeQuery(query, params);
    if (rows.length === 1) {
      return this.mapRowToGroup(rows[0]);
    }
    return null;
  }
}
