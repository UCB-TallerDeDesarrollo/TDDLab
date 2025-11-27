import * as fs from 'fs';
import * as path from 'path';

export class TimelineWriter {
  private readonly filePath: string;

  constructor(rootPath: string) {
    const folder = path.join(rootPath, ".tddlab");
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }

    this.filePath = path.join(folder, "timeline.json");

    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, "[]", "utf8");
    }
  }

  addTestResult(result: {
    passed: number;
    total: number;
    timestamp: number;
  }): void {
    const data = JSON.parse(fs.readFileSync(this.filePath, "utf8"));

    data.push({
      type: "test",
      passed: result.passed,
      total: result.total,
      timestamp: result.timestamp
    });

    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf8");
  }

  addCommitPoint(commitName: string): void {
    const data = JSON.parse(fs.readFileSync(this.filePath, "utf8"));

    data.push({
      type: "commit",
      commitName,
      timestamp: Date.now()
    });

    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf8");
  }
}
