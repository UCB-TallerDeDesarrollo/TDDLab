import { promises as fs } from "fs";
import path from "path";
import { Pool } from "pg";
import tddConfig from "../../../config/tddDb";
import { ITDDResultsRepository, TDDResultsSnapshot } from "../Domain/ITDDResultsRepository";
import { CommitHistoryData } from "../Domain/ICommitHistoryData";

const empty = (): TDDResultsSnapshot => ({ commitHistory: [], tddLog: [] });
const copy = <T>(value: T): T => JSON.parse(JSON.stringify(value));

/** One projection shared by the three adapters and the legacy JSON reader. */
export function mapCommitHistory(history: Record<string, any>[]): CommitHistoryData[] {
  return history.map(entry => ({
    html_url: entry.html_url ?? entry.commit.url,
    sha: entry.sha,
    stats: { ...entry.stats },
    commit: { ...entry.commit, date: new Date(entry.commit.date) },
    coverage: entry.coverage,
    test_count: entry.test_count,
    conclusion: entry.conclusion,
  })).sort((a, b) => b.commit.date.getTime() - a.commit.date.getTime());
}

abstract class TDDResultsRepository implements ITDDResultsRepository {
  abstract getSnapshot(owner: string, repo: string, branch: string): Promise<TDDResultsSnapshot>;
  abstract saveSnapshot(owner: string, repo: string, branch: string, snapshot: TDDResultsSnapshot): Promise<void>;
  async getCommitHistoryData(owner: string, repo: string, branch = "main") {
    return mapCommitHistory((await this.getSnapshot(owner, repo, branch)).commitHistory);
  }
  async getCommitCyclesData(owner: string, repo: string, branch = "main") {
    return (await this.getSnapshot(owner, repo, branch)).commitHistory.map(entry => ({
      url: entry.commit.url, sha: entry.sha, tddCycle: entry.tdd_cycle ?? "null", coverage: entry.coverage,
    }));
  }
  async getTestLog(owner: string, repo: string, branch = "main") {
    return (await this.getSnapshot(owner, repo, branch)).tddLog;
  }
}

export class FakeTDDResultsRepository extends TDDResultsRepository {
  private snapshots = new Map<string, TDDResultsSnapshot>();
  constructor() {
    super();
    const commitHistory = ["success", "failure", "skipped"].map((conclusion, index) => ({
      sha: ["commit-all-tests-passed", "commit-tests-failed", "commit-without-tests"][index],
      stats: { total: index + 1, additions: index + 1, deletions: 0, date: "2026-11-25" },
      commit: { date: `2026-11-25T14:0${index}:00.000Z`, message: conclusion, url: `https://github.com/demo/tests/commit/${conclusion}`, comment_count: 0 },
      coverage: index === 0 ? 100 : 0, test_count: index === 2 ? 0 : 2, conclusion,
    }));
    this.snapshots.set(JSON.stringify(["demo", "tests", "main"]), { commitHistory, tddLog: [] });
  }
  async getSnapshot(owner: string, repo: string, branch: string) {
    return copy(this.snapshots.get(JSON.stringify([owner, repo, branch])) ?? empty());
  }
  async saveSnapshot(owner: string, repo: string, branch: string, snapshot: TDDResultsSnapshot) {
    this.snapshots.set(JSON.stringify([owner, repo, branch]), copy(snapshot));
  }
}

/** Local replacement for the two historical JSON files, useful for parity QA. */
export class FileTDDResultsRepository extends TDDResultsRepository {
  private writes: Promise<void> = Promise.resolve();
  constructor(private readonly directory: string) { super(); }
  private filename(owner: string, repo: string, branch: string) {
    // Encode the complete identity: slashes, dots and branch names cannot traverse the directory.
    return path.join(this.directory, Buffer.from(JSON.stringify([owner, repo, branch])).toString("hex") + ".json");
  }
  async getSnapshot(owner: string, repo: string, branch: string) {
    await this.writes;
    try { return JSON.parse(await fs.readFile(this.filename(owner, repo, branch), "utf8")) as TDDResultsSnapshot; }
    catch (error: any) { if (error.code === "ENOENT") return empty(); throw error; }
  }
  async saveSnapshot(owner: string, repo: string, branch: string, snapshot: TDDResultsSnapshot) {
    const content = JSON.stringify(snapshot);
    const write = this.writes.then(async () => {
      await fs.mkdir(this.directory, { recursive: true });
      const filename = this.filename(owner, repo, branch);
      const temporary = `${filename}.${process.pid}.tmp`;
      await fs.writeFile(temporary, content, "utf8");
      await fs.rename(temporary, filename);
    });
    this.writes = write.catch(() => {});
    await write;
  }
}

export class DatabaseTDDResultsRepository extends TDDResultsRepository {
  constructor(readonly pool: Pool = new Pool(tddConfig)) { super(); }
  async getSnapshot(owner: string, repo: string, branch: string) {
    const result = await this.pool.query(
      "SELECT commit_history, tdd_log FROM tdd_result_snapshots WHERE owner = $1 AND reponame = $2 AND branch = $3",
      [owner, repo, branch],
    );
    return result.rows.length ? { commitHistory: result.rows[0].commit_history, tddLog: result.rows[0].tdd_log } : empty();
  }
  async saveSnapshot(owner: string, repo: string, branch: string, snapshot: TDDResultsSnapshot) {
    // Both files are a single atomic row. Replays update that row without duplicates.
    await this.pool.query(
      `INSERT INTO tdd_result_snapshots (owner, reponame, branch, commit_history, tdd_log)
       VALUES ($1, $2, $3, $4::jsonb, $5::jsonb)
       ON CONFLICT (owner, reponame, branch) DO UPDATE
       SET commit_history = EXCLUDED.commit_history, tdd_log = EXCLUDED.tdd_log`,
      [owner, repo, branch, JSON.stringify(snapshot.commitHistory), JSON.stringify(snapshot.tddLog)],
    );
  }
}
