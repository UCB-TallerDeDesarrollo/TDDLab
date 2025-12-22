import { db } from "../../../config/TDDLogs-Firebase";
import { FieldValue } from "firebase-admin/firestore";
import { IDBCommit } from "../Domain/IDBCommit";
import { IDBBranchWithCommits } from "../Domain/IDBBranchWithCommits";
import { IFirebaseDBBranchesCommitsRepository } from "../Domain/IFirebaseDBBranchesCommitsRepository";
import { CommitData } from '../Domain/CommitData';
import { TestRunsData } from '../Domain/TestRunsData';
import { ITestRun } from "../Domain/ITestRun";

export class FirebaseDBBranchesCommitsRepository implements IFirebaseDBBranchesCommitsRepository {
  async saveCommit(commitData: CommitData): Promise<void> {
    try {
      const commitRef = db.collection("commits").doc(commitData._id);
      await commitRef.set(commitData);
      
      console.log(`Commit ${commitData._id} saved successfully.`);

      const branchesRef = db.collection("branches");
      const branchQuery = await branchesRef
        .where("user_id", "==", commitData.user_id)
        .where("repo_name", "==", commitData.repo_name)
        .where("branch_name", "==", commitData.branch)
        .limit(1)
        .get();

      if (branchQuery.empty) {
        // If branch doesn't exist, create it
        const newBranchRef = branchesRef.doc();
        await newBranchRef.set({
          _id: newBranchRef.id,
          user_id: commitData.user_id,
          repo_name: commitData.repo_name,
          branch_name: commitData.branch,
          commits: [commitData._id],
          last_commit: commitData._id,
          updated_at: FieldValue.serverTimestamp(),
        });
        console.log(`New branch '${commitData.branch}' created and commit added.`);
      } else {
        // If branch exists, update it
        const branchDoc = branchQuery.docs[0];
        await branchDoc.ref.update({
          commits: FieldValue.arrayUnion(commitData._id),
          last_commit: commitData._id,
          updated_at: FieldValue.serverTimestamp(),
        });
        console.log(`Existing branch '${commitData.branch}' updated with commit.`);
      }

    } catch (error) {
      console.error("Error saving commit:", error);
      throw error;
    }
  }

  async saveTestRuns(testRunsData: TestRunsData): Promise<void> {
    try {
      const testRunsRef = db.collection("test-runs").doc(testRunsData.commit_sha);
      await testRunsRef.set(testRunsData);
      console.log(`Test runs for commit ${testRunsData.commit_sha} saved successfully.`);
    } catch (error) {
      console.error("Error saving test runs:", error);
      throw error;
    }
  }

  async getBranchesWithCommits(owner: string, repoName: string): Promise<IDBBranchWithCommits[]> {
    try {
      const branchesRef = db.collection("branches");
      
      let snapshot = await branchesRef
        .where("user_id", "==", owner)
        .where("repo_name", "==", repoName)
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
            const testRunsMap = new Map<string, ITestRun>();
            const commitShas = commits.map(c => c.sha);
            
            const chunkSize = 10;
            for (let i = 0; i < commitShas.length; i += chunkSize) {
                const chunk = commitShas.slice(i, i + chunkSize);
                let testRunsSnapshot = await testRunsRef
                        .where("commit_sha", "in", chunk)
                        .get();
                
                testRunsSnapshot.forEach(doc => {
                    const data = doc.data();
                    const sha = data.commit_sha || data.id || doc.id;
                    testRunsMap.set(sha, data as ITestRun);
                });
            }
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
