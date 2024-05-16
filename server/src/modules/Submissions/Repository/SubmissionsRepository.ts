import { Pool } from "pg";
import config from "../../../config/db";
import { SubmissionCreationObect, SubmissionDataObect } from "../Domain/Submission";

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
    public mapRowToSubmissions(row: any): SubmissionDataObect{
        return{
            id: row.id,
            assignmentid: row.assignmentid,
            userid: row.userid,
            state: row.state,
            link: row.link,
            start_date: row.start_date,
            end_date: row.end_date,
            comment: row.comment,
        }
    }
    async CreateSubmission(Submission: SubmissionCreationObect): Promise<SubmissionCreationObect> {
        const query = "INSERT INTO submissions (assignmentid,userid,state,link,start_date,end_date,comment) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *";
        const values = [Submission.assignmentid, Submission.userid, Submission.state, Submission.link, Submission.start_date, Submission.end_date, Submission.comment];
        const rows = await this.executeQuery(query, values);
        return this.mapRowToSubmissions(rows[0]);
    }
    async ObtainSubmissions(): Promise<SubmissionDataObect[]> {
        const query = "SELECT * FROM submissions";
        const rows =await this.executeQuery(query);
        return rows.map((row) => this.mapRowToSubmissions(row));
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
}

export default SubmissionRepository;