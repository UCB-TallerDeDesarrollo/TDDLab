import * as path from "path";
import * as vscode from "vscode";
import * as fs from "fs";

class FileRepository {
  private readJsonFile(relativePath: string): any {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) return;

    const rootPath = workspaceFolders[0].uri.fsPath;
    const fullPath = path.join(rootPath, relativePath);
    const content = fs.readFileSync(fullPath, "utf-8");
    return JSON.parse(content);
  }

  public getTDDLog(): any {
    return this.readJsonFile("script/tdd_log.json");
  }

  public getPrompt(): string {
    const promptJson = this.readJsonFile("script/VSCodeExtensionPrompt.json");
    return promptJson.prompt;
  }
}

export default FileRepository;
