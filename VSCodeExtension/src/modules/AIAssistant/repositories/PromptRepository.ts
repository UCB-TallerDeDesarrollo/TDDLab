import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

class PromptRepository {
  public getPrompt(context: vscode.ExtensionContext): string {
    const promptPath = path.join(
      context.extensionPath,
      "resources",
      "VSCodeExtensionPrompt.json"
    );
    const fileContent = fs.readFileSync(promptPath, "utf-8");
    const promptJson = JSON.parse(fileContent);
    return promptJson.prompt;
  }
}

export default PromptRepository;
