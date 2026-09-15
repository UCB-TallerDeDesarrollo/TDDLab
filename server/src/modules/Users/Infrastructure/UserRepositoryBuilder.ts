import { IDatabaseConnection, IDatabaseConnectionFactory } from "../../Shared/Domain/IDatabaseConnectionFactory";
import { UsersSchema } from "../Domain/Schema/Users";
import { UsersOptions } from "../Domain/Schema/Options/UsersOptions";
import { queryBuilderFactory } from "../../Shared/Infrastructure/QueryBuilder/QueryBuilderFactory";
import { IUserRepository } from "../Domain/IUserRepository";
import { User, UserCreationObect } from "../Domain/User";

export class UserRepositoryBuilder implements IUserRepository {
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

  private mapRowToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      role: row.role,
      groupid: row.groupid,
    };
  }

  async registerUser(user: UserCreationObect): Promise<void> {
    const connection = await this.connectionFactory.getConnection();
    try {
      const { query, params } = queryBuilderFactory
        .create(UsersSchema)
        .insert(user)
        .build();

      await connection.query(query, params);
    } finally {
      connection.release();
    }
  }

  async obtainUserByemail(email: string): Promise<User | null> {
    const { query, params } = queryBuilderFactory
      .create(UsersSchema)
      .select()
      .where(new UsersOptions().byEmail(email))
      .build();

    const rows = await this.executeQuery(query, params);
    if (rows.length >= 1) {
      return {
        id: rows[0].id,
        email: rows[0].email,
        groupid: rows.map((row) => row.groupid),
        role: rows[0].role,
      };
    }
    return null;
  }

  async obtainUser(id: number): Promise<User | null> {
    const { query, params } = queryBuilderFactory
      .create(UsersSchema)
      .select()
      .where(new UsersOptions().byId(id))
      .limit(1)
      .build();

    const rows = await this.executeQuery(query, params);
    if (rows.length === 1) {
      return this.mapRowToUser(rows[0]);
    }
    return null;
  }

  async obtainUsers(): Promise<User[] | null> {
    const { query, params } = queryBuilderFactory
      .create(UsersSchema)
      .select()
      .build();

    const rows = await this.executeQuery(query, params);
    return rows.length > 0 ? rows.map((row) => this.mapRowToUser(row)) : null;
  }

  async getUsersByGroupid(groupid: number): Promise<User[]> {
    const { query, params } = queryBuilderFactory
      .create(UsersSchema)
      .select()
      .where(new UsersOptions().byGroupId(groupid))
      .build();

    const rows = await this.executeQuery(query, params);
    return rows.map((row) => this.mapRowToUser(row));
  }

    async removeUserFromGroup(userId: number): Promise<void> {
    const { query, params } = queryBuilderFactory
      .create(UsersSchema)
      .delete()
      .where(new UsersOptions().byId(userId))
      .build();

    await this.executeQuery(query, params);
  }

  async updateUser(id: number, groupid: number): Promise<User | null> {
    const { query, params } = queryBuilderFactory
      .create(UsersSchema)
      .update({ groupid })
      .where(new UsersOptions().byId(id))
      .returning()
      .build();

    const rows = await this.executeQuery(query, params);
    if (rows.length === 1) {
      return this.mapRowToUser(rows[0]);
    }
    return null;
  }
}
