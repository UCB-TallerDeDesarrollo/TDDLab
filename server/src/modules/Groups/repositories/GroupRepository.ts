import { Pool } from "pg";
import config from "../../../config/db";
import GroupDataObject from "../domain/Group";

const pool = new Pool(config);

interface GroupCreationObject {
  groupDetail: string;
}

class GroupRepository {
  public async executeQuery(query: string, values?: any[]): Promise<any[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(query, values);
      return result.rows;
    } finally {
      client.release();
    }
  }

  public mapRowToGroup(row: any): GroupDataObject {
    return {
      id: row.id,
      groupDetail: row.groupDetail,
    };
  }

  async obtainGroups(): Promise<GroupDataObject[]> {
    const query = "SELECT id, groupDetail FROM Groups";
    const rows = await this.executeQuery(query);
    return rows.map((row) => this.mapRowToGroup(row));
  }

  async obtainGroupById(id: string): Promise<GroupDataObject | null> {
    const query = "SELECT * FROM Groups WHERE id = $1";
    const values = [id];
    const rows = await this.executeQuery(query, values);
    if (rows.length === 1) {
      return this.mapRowToGroup(rows[0]);
    }
    return null;
  }

  async createGroup(group: GroupCreationObject): Promise<GroupDataObject> {
    const { groupDetail } = group;
    const query = "INSERT INTO Groups (groupDetail) VALUES ($1) RETURNING *";
    const values = [groupDetail];
    const rows = await this.executeQuery(query, values);
    return this.mapRowToGroup(rows[0]);
  }

  async deleteGroup(id: string): Promise<void> {
    const query = "DELETE FROM Groups WHERE id = $1";
    const values = [id];
    await this.executeQuery(query, values);
  }

  async updateGroup(
    id: string,
    updatedGroup: GroupCreationObject
  ): Promise<GroupDataObject | null> {
    const { groupDetail } = updatedGroup;
    const query =
      "UPDATE Groups SET groupDetail = $1 WHERE id = $2 RETURNING *";
    const values = [groupDetail, id];
    const rows = await this.executeQuery(query, values);
    if (rows.length === 1) {
      return this.mapRowToGroup(rows[0]);
    }
    return null;
  }
}

export default GroupRepository;
