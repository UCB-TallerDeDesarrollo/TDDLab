import { Pool } from "pg";
import config from "../../../config/db";
import { User, UserCreationObect } from "../Domain/User";

export class UserRepository {
  pool: Pool;
  constructor() {
    this.pool = new Pool(config);
  }
  public mapRowToUser(row: any): User{
    return{
      id:row.id,
      email:row.email,
      role:row.role,
      groupid:row.groupid,
      firstName:row.first_name,
      lastName:row.last_name
    };
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
  async registerUser(user: UserCreationObect) {
    const client = await this.pool.connect();
    try {
      const query = "INSERT INTO usersTable (email,groupid,role,first_name,last_name) VALUES ($1, $2, $3, $4, $5)";
      const values = [user.email, user.groupid, user.role, user.firstName, user.lastName];

      await client.query(query, values);
    } catch (error) {
      console.error("Error inserting records:", error);
    } finally {
      if (client) {
        client.release();
      }
    }
  }
  async obtainUserByemail(email: string): Promise<User | null> {
    const query = "SELECT id, email, groupid, role, first_name, last_name FROM usersTable WHERE email = $1";
    const values = [email];
    const rows = await this.executeQuery(query, values);
    if (rows.length >= 1) {
      return { 
        id: rows[0].id,
        email: rows[0].email,
        groupid: rows.map((row) => row.groupid),
        role: rows[0].role,
        firstName: rows[0].first_name,
        lastName: rows[0].last_name
      };
    }
    return null;
  }
  async obtainUser(id: number): Promise<User | null> {
    const query = "SELECT id, email, groupid, role, first_name, last_name FROM usersTable WHERE id = $1";
    const values = [id];
    const rows = await this.executeQuery(query, values);
    if (rows.length === 1) {
      return this.mapRowToUser(rows[0]);
    }
    return null;
  }
  async obtainUsers(): Promise<User[] | null> {
    const query = "SELECT id, email, groupid, role, first_name, last_name FROM usersTable";
    const rows = await this.executeQuery(query);
    return rows.length > 0 ? rows.map(row => this.mapRowToUser(row)) : null;
  }

  async getUsersByGroupid(groupid: number): Promise<User[]> {
    const query = "SELECT * FROM userstable WHERE groupid = $1";
    const values = [groupid];
    const rows = await this.executeQuery(query,values);
    return rows.map((row) => this.mapRowToUser(row));
  }

  async removeUserFromGroup(userId: number): Promise<void> {
    const query = "DELETE FROM userstable WHERE id = $1";
    const values = [userId];
  
    try {
      await this.executeQuery(query, values);
      console.log(`Usuario con ID ${userId} ha sido eliminado`);
    } catch (error) {
      console.error("Error al eliminar usuario", error);
      throw error;
    }
  }
  
  async updateUser(id: number, groupid: number,): Promise<User | null> {
    const query =
      "UPDATE userstable SET groupid = $2 WHERE id = $1 RETURNING *"; 
    const values = [id,groupid]; 
    const rows = await this.executeQuery(query, values);
    if (rows.length === 1) {
      return this.mapRowToUser(rows[0]);
    }
    return null;
  }

  async updateUserById(id: number, firstName: string, lastName: string): Promise<User | null> {
    const query = `UPDATE userstable SET first_name = $2, last_name = $3 WHERE id = $1 RETURNING *`;
    const values = [id, firstName, lastName];
    const rows = await this.executeQuery(query, values);

    if (rows.length === 1) {
      return this.mapRowToUser(rows[0]);
    }

    return null;
  }

async updateUserRole(id: number, role: string): Promise<User | null> {
  const query = `UPDATE userstable SET role = $2 WHERE id = $1 RETURNING *`;
  const values = [id, role];
  const rows = await this.executeQuery(query, values);

  if (rows.length === 1) {
    return this.mapRowToUser(rows[0]);
  }

  return null;
}

}
