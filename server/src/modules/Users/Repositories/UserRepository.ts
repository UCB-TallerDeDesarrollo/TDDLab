import { Pool } from "pg"; // Import the Pool from 'pg'
import config from "../../../config/db";
import { User } from "../Domain/User";

export class UserRepository {
  pool: Pool;
  constructor() {
    this.pool = new Pool(config);
  }
  async registerUser(user: User) {
    const client = await this.pool.connect();
    try {
      const query = "INSERT INTO usersTable (email,course) VALUES ($1, $2)";
      const values = [user.email, user.course];

      await client.query(query, values);
    } catch (error) {
      console.error("Error inserting records:", error);
    } finally {
      if (client) {
        client.release();
      }
    }
  }
}
