import { CommitRepository } from "../Repositories/commitRepository";
import { CommitDTO } from "../Domain/CommitDTO";
import { Request, Response } from "express";
const Adapter = new CommitRepository();

export const saveOneCommitInfo = async (
  commitData: CommitDTO,
  owner: string,
  repoName: string
) => {
  return await Adapter.saveCommitInfoOfRepo(owner, repoName, commitData);
};
export const getCommitsOfRepo = async (req: Request, res: Response) => {
  try {
    const owner = String(req.query.owner);
    const repoName = String(req.query.repoName);
    if (!owner || !repoName) {
      return res
        .status(400)
        .json({ error: "Bad request, missing owner or repoName" });
    }
    let ans = await Adapter.getCommitsOfRepo(owner, repoName);
    return res.status(200).json(ans);
  } catch (error) {
    return res.status(500).json({ error: "server error" });
  }
};
