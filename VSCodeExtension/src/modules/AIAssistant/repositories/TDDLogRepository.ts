import * as path from "path";
import * as vscode from "vscode";
import * as fs from "fs";

class TDDLogRepository {
  private readTddLogFile(tddLogPath: string): string {
    return fs.readFileSync(tddLogPath, "utf-8");
  }

  private parseJson(content: string): any {
    return JSON.parse(content);
  }

  public getTDDLog(): any {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) return;

    const rootPath = workspaceFolders[0].uri.fsPath;
    const tddLogPath = path.join(rootPath, "/script/tdd_log.json");
    const tddLogContent = this.readTddLogFile(tddLogPath);
    const tddLogJson = this.parseJson(tddLogContent);
    return tddLogJson;
  }
}

export default TDDLogRepository;
