import { commitRepository } from "../../adapters/dataBaseRepositories/commitRepository";
import { CommitDTO } from "../../domain/models/CommitDTO";
import { Request, Response } from 'express';
const Adapter=new commitRepository()

export const saveOneCommitInfo = async (req: Request, _res: Response) => {
    
    const fakeCommitData: CommitDTO = {
        html_url: "https://github.com/user/repo/commit/12345",
        stats: {
            total: 100,
            additions: 50,
            deletions: 50,
        },
        commit: {
            message: "Fixed a bug in the authentication process",
            url: "https://github.com/user/repo/commit/12345",
            comment_count: 3,
        },
        sha: "12345abcdef",
        };
        try {
            let ans= await Adapter.saveCommitInfoOfRepo("DwijanX","test",fakeCommitData)
            _res.status(201).json(ans)
        } catch (error) {
            
            _res.status(500).json({error:"Server error"})
        }
  };