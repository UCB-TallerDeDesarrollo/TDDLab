import { Pool } from "pg"; // Import the Pool from 'pg'
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
  async obtainUserByemail(email: string): Promise<User | null> {
    const query = "SELECT id, email, groupid, role FROM usersTable WHERE email = $1";
    const values = [email];
    const rows = await this.executeQuery(query, values);
    if (rows.length >= 1) {
      return { // Solo devuelve el primer usuario encontrado, considerar cambiarlo cuando se rediseñe la base de datos
        id: rows[0].id,
        email: rows[0].email,
        groupid: rows.map((row) => row.groupid),
        role: rows[0].role,
      };
    }
    return null;
  }
  async obtainUser(id: number): Promise<User | null> {
    const query = "SELECT id, email, groupid, role FROM usersTable WHERE id = $1";
    const values = [id];
    const rows = await this.executeQuery(query, values);
    if (rows.length === 1) {
      return rows[0];
    }
    return null;
  }
  async obtainUsers(): Promise<User[] | null> {
    const query = "SELECT id, email, groupid, role FROM usersTable";
    const rows = await this.executeQuery(query);
    return rows.length > 0 ? rows : null;
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
      throw error; // Relanzar error para manejarlo en capas superiores
    }
  }
  
  async updateUser(
    id: number,
    groupid: number,
  ): Promise<Promise<User | null>> {
    const query =
      "UPDATE userstable SET groupid = $2 WHERE id = $1 RETURNING *"; // Actualizado para modificar solo el ID del grupo
    const values = [id,groupid]; // Ajustado para reflejar el nuevo ID del grupo y el ID del usuario
    const rows = await this.executeQuery(query, values);
    if (rows.length === 1) {
      return rows[0];
    }
    return null;
  }
  
}
