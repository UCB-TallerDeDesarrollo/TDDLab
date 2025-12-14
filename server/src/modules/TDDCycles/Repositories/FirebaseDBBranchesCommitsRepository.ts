import { db } from "../../../config/firebase";
import { IDBCommit } from "../Domain/IDBCommit";
import { IDBBranchWithCommits } from "../Domain/IDBBranchWithCommits";
import { IFirebaseDBBranchesCommitsRepository } from "../Domain/IFirebaseDBBranchesCommitsRepository";
import { ITestRun } from "../Domain/ITestRun";

export class FirebaseDBBranchesCommitsRepository implements IFirebaseDBBranchesCommitsRepository {
  async getBranchesWithCommits(owner: string, repoName: string): Promise<IDBBranchWithCommits[]> {
    try {
      const branchesRef = db.collection("branches");
      
      let snapshot = await branchesRef
        .where("user_id", "==", owner)
        .where(" repo_name", "==", repoName)
        .get();

      if (snapshot.empty) {
        return [];
      }

      const branchesWithCommits = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const branchData = doc.data();
          const branchName = branchData.branch_name || branchData[" branch_name"];
          const branchCommitsShas = branchData.commits || branchData[" commits"] || [];
          
          let commits: IDBCommit[] = [];
          
          if (Array.isArray(branchCommitsShas) && branchCommitsShas.length > 0) {
             const commitsRef = db.collection("commits");
             const chunkSize = 10;
             for (let i = 0; i < branchCommitsShas.length; i += chunkSize) {
                const chunk = branchCommitsShas.slice(i, i + chunkSize);
                let commitSnap = await commitsRef.where("sha", "in", chunk).get();
                
                if (commitSnap.empty) {
                    commitSnap = await commitsRef.where("_id", "in", chunk).get();
                }

                commitSnap.forEach(doc => {
                    const data = doc.data();
                    commits.push({ ...data, sha: data.sha || data._id || doc.id } as IDBCommit);
                });
             }
          } 
          
          if (commits.length === 0) {
            const commitsRef = db.collection("commits");
            let commitsSnapshot = await commitsRef
                .where("repo_name", "==", repoName)
                .where("user_id", "==", owner)
                .where("branch", "==", branchName)
                .get();

            if (commitsSnapshot.empty) {
                commitsSnapshot = await commitsRef
                    .where(" repo_name", "==", repoName)
                    .where("user_id", "==", owner)
                    .where("branch", "==", branchName)
                    .get();
            }

            if (!commitsSnapshot.empty) {
                commits = commitsSnapshot.docs.map(doc => {
                    const data = doc.data();
                    return { 
                        ...data, 
                        sha: data.sha || data._id || doc.id 
                    } as IDBCommit;
                });
            }
          }

          if (commits.length > 0) {
            const testRunsRef = db.collection("test-runs");
            const testRunsSnapshot = await testRunsRef
                .where("repo_name", "==", repoName)
                .where("user_id", "==", owner)
                .where("branch", "==", branchName)
                .get();
            
            const testRunsMap = new Map<string, ITestRun>();
            testRunsSnapshot.forEach(doc => {
                const data = doc.data();
                testRunsMap.set(data.commit_sha, data as ITestRun);
            });

            commits = commits.map(commit => {
                return {
                    ...commit,
                    test_run: testRunsMap.get(commit.sha)
                };
            });
          }
          
          let updatedAt = branchData.updated_at || branchData[" updated_at"];
          if (updatedAt && typeof updatedAt.toDate === 'function') {
            updatedAt = updatedAt.toDate();
          } else if (updatedAt && updatedAt._seconds) {
            updatedAt = new Date(updatedAt._seconds * 1000);
          }

          return {
            _id: branchData._id || doc.id,
            user_id: branchData.user_id || branchData[" user_id"],
            repo_name: branchData.repo_name || branchData[" repo_name"],
            branch_name: branchName,
            commits: commits,
            last_commit: branchData.last_commit || branchData[" last_commit"],
            updated_at: updatedAt
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
