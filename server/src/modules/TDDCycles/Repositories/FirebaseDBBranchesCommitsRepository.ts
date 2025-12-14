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
        .where(" repo_name", "==", repoName)
        .get();

      if (snapshot.empty) {
        return [];
      }

      const branchesWithCommits = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const branchData = doc.data();
          console.log("Branch Data from DB:", branchData);
          
          // Handle potential leading spaces in keys or missing keys
          const commitsData = branchData.commits || branchData[" commits"] || [];
          const commitShas = Array.isArray(commitsData) ? commitsData : [];
          
          console.log("Commit SHAs:", commitShas);

          let commits: IDBCommit[] = [];
          if (commitShas.length > 0) {
            const commitsRef = db.collection("commits");
            const commitRefs = commitShas.map((sha: string) => commitsRef.doc(sha));
            
            if (commitRefs.length > 0) {
                const commitSnapshots = await db.getAll(...commitRefs);
                commits = commitSnapshots
                .filter((snap) => snap.exists)
                .map((snap) => {
                    const data = snap.data();
                    return { ...data, _id: snap.id } as IDBCommit;
                });
            }
          }

          return {
            ...branchData,
            _id: branchData._id || doc.id, // Ensure _id is present
            commits: commits, 
          } as IDBBranchWithCommits;
        })
      );

      return branchesWithCommits;
    } catch (error) {
      console.error("Error getting branches with commits:", error);
      throw error;
    }
  }
}
