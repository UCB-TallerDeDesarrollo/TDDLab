import { Pool } from "pg";
import config from "../../../config/db";
import { PracticeSubmissionCreationObject, PracticeSubmissionDataObject, PracticeSubmissionUpdateObject } from "../Domain/PracticeSubmission";

interface QueryResult {
    exists: boolean;
}

const pool = new Pool(config);

class PracticeSubmissionRepository{
    public async executeQuery(query: string, values?: any[]): Promise<any[]> {
        const client = await pool.connect();
        try {
          const result = await client.query(query, values);
          return result.rows;
        } finally {
          client.release();
        }
    }
    public mapRowToPracticeSubmissions(row: any): PracticeSubmissionDataObject{
        return{
            id: row.id,
            practiceid: row.practiceid,
            userid: row.userid,
            status: row.status,
            repository_link: row.repository_link,
            start_date: row.start_date,
            end_date: row.end_date,
            comment: row.comment,
        }
    }
    async CreatePracticeSubmission(PracticeSubmission: PracticeSubmissionCreationObject): Promise<PracticeSubmissionCreationObject> {
        const query = "INSERT INTO practicesubmissions (practiceid,userid,status,repository_link,start_date) VALUES ($1, $2, $3, $4, $5) RETURNING *";
        const values = [PracticeSubmission.practiceid, PracticeSubmission.userid, PracticeSubmission.status, PracticeSubmission.repository_link, PracticeSubmission.start_date];
        const rows = await this.executeQuery(query, values);
        return this.mapRowToPracticeSubmissions(rows[0]);
    }
    async ObtainPracticeSubmissions(): Promise<PracticeSubmissionDataObject[]> {
        const query = "SELECT * FROM practicesubmissions";
        const rows =await this.executeQuery(query);
        return rows.map((row) => this.mapRowToPracticeSubmissions(row));
    }

    async UpdatePracticeSubmission(id: number, updatedSubmission: PracticeSubmissionUpdateObject): Promise<PracticeSubmissionUpdateObject | null> {
        const { status, end_date, comment } = updatedSubmission;
        const query = "UPDATE practicesubmissions SET status = $1, end_date = $2, comment = $3 WHERE id = $4 RETURNING *";
        const values = [
            status,
            end_date,
            comment,
            id
        ];
        const rows = await this.executeQuery(query, values);
        if (rows.length === 1) {
            return this.mapRowToPracticeSubmissions(rows[0]);
        }
        return null;
    }

    async deletePracticeSubmission(id: number): Promise<void> {
        const query = "DELETE FROM practicesubmissions WHERE id = $1";
        const values = [id];
        await this.executeQuery(query, values);
    }

    async practiceidExistsForPracticeSubmission(practiceid: number): Promise<boolean> {
        const query = "SELECT EXISTS (SELECT 1 FROM practices WHERE id = $1)";
        const result: QueryResult[] = await this.executeQuery(query, [practiceid]);
        return result[0].exists;
    }

    async useridExistsForPracticeSubmission(userid: number): Promise<boolean> {
        const query = "SELECT EXISTS (SELECT 1 FROM userstable WHERE id = $1)";
        const result: QueryResult[] = await this.executeQuery(query, [userid]);
        return result[0].exists;
    }
    public async getPracticeSubmissionByPracticeAndUser(practiceid: number, userid: number): Promise<PracticeSubmissionDataObject | null> {
        const query = "SELECT * FROM practicesubmissions WHERE practiceid = $1 AND userid = $2";
        const values = [practiceid, userid];
        const rows = await this.executeQuery(query, values);
        if (rows.length > 0) {
            return this.mapRowToPracticeSubmissions(rows[0]);
        }
        return null;
    }

    public async getPracticeSubmissionsByPracticeId(practiceid: number): Promise<PracticeSubmissionDataObject[]> {
        const query = "SELECT * FROM practicesubmissions WHERE practiceid = $1";
        const values = [practiceid];
        const rows = await this.executeQuery(query, values);
        return rows.map((row) => this.mapRowToPracticeSubmissions(row));
    }
}

export default PracticeSubmissionRepository;