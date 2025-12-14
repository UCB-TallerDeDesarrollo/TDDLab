import { db } from "../../../config/firebase";
import { IDBBranch } from "../Domain/IDBBranch";
import { IDBCommit } from "../Domain/IDBCommit";
import { IDBBranchWithCommits } from "../Domain/IDBBranchWithCommits";
import { IFirebaseDBBranchesCommitsRepository } from "../Domain/IFirebaseDBBranchesCommitsRepository";

export class FirebaseDBBranchesCommitsRepository implements IFirebaseDBBranchesCommitsRepository {
  async getBranchesWithCommits(owner: string, repoName: string): Promise<IDBBranchWithCommits[]> {
    try {
      const branchesRef = db.collection("branches");
      const snapshot = await branchesRef
        .where("user_id", "==", owner)
        .where("repo_name", "==", repoName)
        .get();

      if (snapshot.empty) {
        return [];
      }

      const branchesWithCommits = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const branchData = doc.data() as IDBBranch;
          const commitShas = branchData.commits || [];

          let commits: IDBCommit[] = [];
          if (commitShas.length > 0) {
            const commitsRef = db.collection("commits");
            const commitRefs = commitShas.map((sha) => commitsRef.doc(sha));
            
            if (commitRefs.length > 0) {
                const commitSnapshots = await db.getAll(...commitRefs);
                commits = commitSnapshots
                .filter((snap) => snap.exists)
                .map((snap) => snap.data() as IDBCommit);
            }
          }

          return {
            ...branchData,
            commits: commits, 
          };
        })
      );

      return branchesWithCommits;
    } catch (error) {
      console.error("Error getting branches with commits:", error);
      throw error;
    }
  }
}
