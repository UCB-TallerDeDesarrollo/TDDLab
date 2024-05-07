import { Pool } from "pg"; // Import the Pool from 'pg'
import config from "../../../config/db";
import { User } from "../Domain/User";

interface UserCreationObject {
  id: number
  email: string;
  groupid: number;
  role: string;
}
export class UserRepository {
  pool: Pool;
  constructor() {
    this.pool = new Pool(config);
  }

  public mapRowToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      groupid: row.groupid,
      role: row.role
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
  async registerUser(user: User) {
    const client = await this.pool.connect();
    try {
      const query = "INSERT INTO usersTable (email,groupid,role) VALUES ($1, $2, $3)";
      const values = [user.email, user.groupid, user.role];

      await client.query(query, values);
    } catch (error) {
      console.error("Error inserting records:", error);
    } finally {
      if (client) {
        client.release();
      }
    }
  }
  async obtainUser(email: string): Promise<User | null> {
    const query = "SELECT email, groupid, role FROM usersTable WHERE email = $1";
    const values = [email];
    const rows = await this.executeQuery(query, values);
    if (rows.length === 1) {
      return rows[0];
    }
    return null;
  }
  async obtainUsers(): Promise<User[] | null> {
    const query = "SELECT id,email, groupid, role FROM usersTable";
    const rows = await this.executeQuery(query);
    return rows.length > 0 ? rows : null;
  }

  async getUsersByGroupid(groupid: number): Promise<User[]> {
    const query = "SELECT * FROM userstable WHERE groupid = $1";
    const values = [groupid];
    const rows = await this.executeQuery(query,values);
    return rows.map((row) => this.mapRowToUser(row));
  }
  async updateGroup(
    id: string,
    updatedGroup: UserCreationObject
  ): Promise<void> {
    const { groupid } = updatedGroup;
    console.log("LLegue aca con esta info", updatedGroup); 
    const query =
      "UPDATE Users SET groupid = $1 WHERE id = $2 RETURNING *"; // Actualizado para modificar solo el ID del grupo
    const values = [groupid, id]; // Ajustado para reflejar el nuevo ID del grupo y el ID del usuario
    const rows = await this.executeQuery(query, values);
    if (rows.length === 1) {
      this.mapRowToUser(rows[0]); // Actualizado para reflejar el mapeo de usuario
    }
    
  }
  
}
