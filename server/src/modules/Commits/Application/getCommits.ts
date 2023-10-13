import { CommitRepository } from "../Repositories/commitRepository";
import { updateCommitsTable } from "./updateCommitsTable";

export const getCommits = async (
  owner: string,
  repoName: string,
  Adapter: CommitRepository = new CommitRepository()
) => {
  try {
    await updateCommitsTable(owner, repoName, Adapter);
  } catch (error) {
    console.error("Error updating commits table:", error);
    return { error: "Error updating commits table" };
  } finally {
    const Jobs = await Adapter.getCommits(owner, repoName);
    return Jobs;
  }
};
