import { Pool } from "pg";
import config from "../../../config/db";
import { SubmissionCreationObject, SubmissionDataObject, SubmissionUpdateObject } from "../Domain/Submission";

interface QueryResult {
    exists: boolean;
}

const pool = new Pool(config);

class SubmissionRepository{
    public async executeQuery(query: string, values?: any[]): Promise<any[]> {
        const client = await pool.connect();
        try {
          const result = await client.query(query, values);
          return result.rows;
        } finally {
          client.release();
        }
    }
    public mapRowToSubmissions(row: any): SubmissionDataObject{
        return{
            id: row.id,
            assignmentid: row.assignmentid,
            userid: row.userid,
            status: row.status,
            repository_link: row.repository_link,
            start_date: row.start_date,
            end_date: row.end_date,
            comment: row.comment,
        }
    }
    async CreateSubmission(Submission: SubmissionCreationObject): Promise<SubmissionCreationObject> {
        const query = "INSERT INTO submissions (assignmentid,userid,status,repository_link,start_date) VALUES ($1, $2, $3, $4, $5) RETURNING *";
        const values = [Submission.assignmentid, Submission.userid, Submission.status, Submission.repository_link, Submission.start_date];
        const rows = await this.executeQuery(query, values);
        return this.mapRowToSubmissions(rows[0]);
    }
    async ObtainSubmissions(): Promise<SubmissionDataObject[]> {
        const query = "SELECT * FROM submissions";
        const rows =await this.executeQuery(query);
        return rows.map((row) => this.mapRowToSubmissions(row));
    }

    async UpdateSubmission(id: number, updatedSubmission: SubmissionUpdateObject): Promise<SubmissionUpdateObject | null> {
        const { status, end_date, comment } = updatedSubmission;
        const query = "UPDATE submissions SET status = $1, end_date = $2, comment = $3 WHERE id = $4 RETURNING *";
        const values = [
            status,
            end_date,
            comment,
            id
        ];
        const rows = await this.executeQuery(query, values);
        if (rows.length === 1) {
            return this.mapRowToSubmissions(rows[0]);
        }
        return null;
    }

    async deleteSubmission(id: number): Promise<void> {
        const query = "DELETE FROM submissions WHERE id = $1";
        const values = [id];
        await this.executeQuery(query, values);
    }

    async assignmentidExistsForSubmission(assignmentid: number): Promise<boolean> {
        const query = "SELECT EXISTS (SELECT 1 FROM assignments WHERE id = $1)";
        const result: QueryResult[] = await this.executeQuery(query, [assignmentid]);
        return result[0].exists;
    }

    async useridExistsForSubmission(userid: number): Promise<boolean> {
        const query = "SELECT EXISTS (SELECT 1 FROM userstable WHERE id = $1)";
        const result: QueryResult[] = await this.executeQuery(query, [userid]);
        return result[0].exists;
    }
    public async getSubmissionByAssignmentAndUser(assignmentid: number, userid: number): Promise<SubmissionDataObject | null> {
        const query = "SELECT * FROM submissions WHERE assignmentid = $1 AND userid = $2";
        const values = [assignmentid, userid];
        const rows = await this.executeQuery(query, values);
        if (rows.length > 0) {
            return this.mapRowToSubmissions(rows[0]);
        }
        return null;
    }

    public async getSubmissionsByAssignmentId(assignmentid: number): Promise<SubmissionDataObject[]> {
        const query = "SELECT * FROM submissions WHERE assignmentid = $1";
        const values = [assignmentid];
        const rows = await this.executeQuery(query, values);
        return rows.map((row) => this.mapRowToSubmissions(row));
    }
}

export default SubmissionRepository;