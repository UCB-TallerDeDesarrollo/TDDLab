import { Request, Response } from "express";
import { GetDBBranchesWithCommitsUseCase } from "../../modules/TDDCycles/Application/GetDBBranchesWithCommitsUseCase";
import { IFirebaseDBBranchesCommitsRepository } from "../../modules/TDDCycles/Domain/IFirebaseDBBranchesCommitsRepository";

class DBBranchesController {
    getDBBranchesWithCommitsUseCase: GetDBBranchesWithCommitsUseCase;

    constructor(repository: IFirebaseDBBranchesCommitsRepository) {
        this.getDBBranchesWithCommitsUseCase = new GetDBBranchesWithCommitsUseCase(repository);
    }

    async getCommitHistoryByBranches(req: Request, res: Response) {
        try {
            const { owner, repoName } = req.query;
            if (!owner || !repoName) {
                return res.status(400).json({ error: "Bad request, missing owner or repoName" });
            }

            const branches = await this.getDBBranchesWithCommitsUseCase.execute(String(owner), String(repoName));
            return res.status(200).json(branches);
        } catch (error) {
            console.error("Error fetching branches with commits:", error);
            return res.status(500).json({ error: "Server error" });
        }
    }
}

export default DBBranchesController;
