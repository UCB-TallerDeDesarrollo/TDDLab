import { GithubAdapter } from "../Repositories/github.API";
import { JobDataObject } from "../Domain/jobInterfaces";
import { Request, Response } from "express";

export class TDDCyclesPort {
  adapter: GithubAdapter;
  constructor() {
    this.adapter = new GithubAdapter();
  }

  async obtainCommitsOfRepo(req: Request, res: Response): Promise<void> {
    try {
      const owner = String(req.query.owner);
      const repoName = String(req.query.repoName);

      if (!owner || !repoName) {
        res
          .status(400)
          .json({ error: "Bad request, missing owner or repoName" });
        return;
      }
      const ans = await this.adapter.obtainCommitsOfRepo(owner, repoName);
      res.status(200).json(ans);
    } catch (error) {
      res.status(500).json({ error: "Server errorr" });
    }
  }

  async obtainCommitsFromSha(req: Request, res: Response): Promise<void> {
    try {
      const owner = String(req.query.owner);
      const repoName = String(req.query.repoName);
      const sha = String(req.query.sha);
      if (!owner || !repoName || !sha) {
        res
          .status(400)
          .json({ error: "Bad request, missing owner or repoName or sha" });
        return;
      }
      const ans = await this.adapter.obtainCommitsFromSha(owner, repoName, sha);
      res.status(200).json(ans);
    } catch (error) {
      res.status(500).json({ error: "Server errorr" });
    }
  }
  //Already declared in separated files
  async obtainJobsData(owner: string, repoName: string){
    
    const githubruns = await this.adapter.obtainRunsOfGithubActions(
      owner,
      repoName
    );
    const commitsWithActions: [number, string][] =
      githubruns.data.workflow_runs.map((workFlowRun: any) => {
        return [workFlowRun.id, workFlowRun.head_commit.id];
      });
    const jobs: Record<string, JobDataObject> = {};
    await Promise.all(
      commitsWithActions.map(async (workflowInfo) => {
        const jobInfo = await this.adapter.obtainJobsOfACommit(
          owner,
          repoName,
          workflowInfo[0],
          1
        );
        jobs[workflowInfo[1]] = jobInfo;
      })
    );
    return jobs
  }
}
