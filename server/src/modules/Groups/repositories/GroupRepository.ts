import { Pool } from "pg";
import config from "../../../config/db";
import GroupDTO from "../domain/Group";

const pool = new Pool(config);
interface GroupCreationObject {
  groupName: string;
  groupDetail: string;
  creationDate: Date;
}
interface QueryResult {
  exists: boolean;
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

  public mapRowToGroup(row: any): GroupDTO {
    return {
      id: row.id,
      groupName: row.groupname,
      groupDetail: row.groupdetail,
      creationDate: row.creationdate,
    };
  }

  async obtainGroups(): Promise<GroupDTO[]> {
    const query = "SELECT id, groupname, groupdetail,creationDate FROM Groups";
    const rows = await this.executeQuery(query);
    return rows.map((row) => this.mapRowToGroup(row));
  }

  async obtainGroupById(id: number): Promise<GroupDTO | null> {
    const query = "SELECT * FROM Groups WHERE id = $1";
    const values = [id];
    const rows = await this.executeQuery(query, values);
    if (rows.length === 1) {
      return this.mapRowToGroup(rows[0]);
    }
    return null;
  }

  async checkGroupExists(groupid: number): Promise<boolean> {
    const query = "SELECT EXISTS (SELECT 1 FROM groups WHERE id = $1)";
    const result: QueryResult[] = await this.executeQuery(query, [groupid]);
    return result[0].exists;
  }

  async createGroup(group: GroupCreationObject): Promise<GroupDTO> {
    const { groupName, groupDetail, creationDate } = group; // Added groupName to the destructuring
    const query =
      "INSERT INTO Groups (groupName, groupDetail,creationdate) VALUES ($1, $2, $3) RETURNING *";
    const values = [groupName, groupDetail, creationDate];
    const rows = await this.executeQuery(query, values);
    return this.mapRowToGroup(rows[0]);
  }

  async deleteGroup(id: number): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const deleteAssignmentsQuery = "DELETE FROM assignments WHERE groupid = $1";
      await client.query(deleteAssignmentsQuery, [id]);

      const deleteGroupQuery = "DELETE FROM groups WHERE id = $1";
      await client.query(deleteGroupQuery, [id]); 

      await client.query('COMMIT'); 
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateGroup(
    id: number,
    updatedGroup: GroupCreationObject
  ): Promise<GroupDTO | null> {
    const { groupName, groupDetail } = updatedGroup; // Added groupName to the destructuring
    const query =
      "UPDATE Groups SET groupName = $1, groupDetail = $2 WHERE id = $3 RETURNING *"; // Updated to include the new field
    const values = [groupName, groupDetail, id];
    const rows = await this.executeQuery(query, values);
    if (rows.length === 1) {
      return this.mapRowToGroup(rows[0]);
    }
    return null;
  }

}

export default GroupRepository;
