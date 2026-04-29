import { Pool } from "pg";
import config from "../../../config/db";
import { PracticeDataObject, PracticeCreationObject } from "../domain/Practice";

const pool = new Pool(config);

class PracticeRepository {
  public async executeQuery(query: string, values?: any[]): Promise<any[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(query, values);
      return result.rows;
    } finally {
      client.release();
    }
  }

  public mapRowToPractice(row: any): PracticeDataObject {
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
    const query =
      "SELECT id, title, description, creation_date, state, userid FROM practices";
    const rows = await this.executeQuery(query);
    return rows.map((row) => this.mapRowToPractice(row));
  }

  async obtainPracticeById(id: string): Promise<PracticeDataObject | null> {
    const query =
      "SELECT id, title, description, creation_date, state, userid FROM practices WHERE id = $1";
    const values = [id];
    const rows = await this.executeQuery(query, values);
    if (rows.length === 1) {
      return this.mapRowToPractice(rows[0]);
    }
    return null;
  }

  async obtainPracticesByUserId(userid: string): Promise<PracticeDataObject[]> {
    const query =
      "SELECT id, title, description, creation_date, state, userid FROM practices WHERE userid = $1";
    const values = [userid];
    const rows = await this.executeQuery(query, values);
    return rows.map(this.mapRowToPractice);
  }

  async createPractice(
    practice: PracticeCreationObject
  ): Promise<PracticeCreationObject> {
    const { title, description, creation_date, state, userid } = practice;
    const query =
      "INSERT INTO practices (title, description, creation_date, state, userid) VALUES ($1, $2, $3, $4, $5) RETURNING *";
    const values = [title, description, creation_date, state, userid];
    const rows = await this.executeQuery(query, values);
    return this.mapRowToPractice(rows[0]);
  }

  async deletePractice(id: string): Promise<void> {
    const query = "DELETE FROM practices WHERE id = $1";
    const values = [id];
    await this.executeQuery(query, values);
  }

  async updatePractice(
    id: string,
    updatedPractice: PracticeCreationObject
  ): Promise<PracticeCreationObject | null> {
    const { title, description, creation_date, state, userid } =
      updatedPractice;
    const query =
      "UPDATE practices SET title = $1, description = $2, creation_date = $3, state = $4, userid = $5 WHERE id = $6 RETURNING *";
    const values = [title, description, creation_date, state, userid, id];
    const rows = await this.executeQuery(query, values);
    if (rows.length === 1) {
      return this.mapRowToPractice(rows[0]);
    }
    return null;
  }
}

export default PracticeRepository;
