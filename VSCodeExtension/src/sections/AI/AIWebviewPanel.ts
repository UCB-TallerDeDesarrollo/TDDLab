import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import simpleGit, { SimpleGit } from 'simple-git';


export class AIWebviewPanel {
  private readonly panel: vscode.WebviewPanel;
  private readonly messages: string[] = [];

  constructor() {
    this.panel = vscode.window.createWebviewPanel(
      'aiPanel',
      'Asistente de IA',
      vscode.ViewColumn.Beside,
      { enableScripts: true }
    );
    this.update();
  }

  public reveal() {
    this.panel.reveal(vscode.ViewColumn.Beside);
  }

  public onDispose(callback: () => void) {
    this.panel.onDidDispose(callback);
  }


  private createMessagesHtml(): string {
    return this.messages.map(msg => `<p>${msg}</p>`).join('');
  }

  private generateHtmlContent(messagesHtml: string): string {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: sans-serif; padding: 1rem; }
          h1 { color: #007acc; }
        </style>
      </head>
      <body>
        <h1>Asistente de IA</h1>
        ${messagesHtml}
      </body>
      </html>
    `;
  }

  public update() {
    const messagesHtml = this.createMessagesHtml();
    this.panel.webview.html = this.generateHtmlContent(messagesHtml);
  }

  private handleError(err: any): void {
    console.error(err);
    this.messages.push('Error leyendo archivos o llamando a la API');
    this.update();
  }

  private async handleApiResponse(response: string): Promise<void> {
    console.log("RESPUESTAAAA", response);
    this.messages.push(response);
    this.update();
  }

  private readTddLogFile(tddLogPath: string): string {
    return fs.readFileSync(tddLogPath, 'utf-8');
  }

  private parseJson(content: string): any {
    return JSON.parse(content);
  }

  private createApiRequestBody(tddLogJson: any, gitInfo: any): string {
    return JSON.stringify({
      tddlog: tddLogJson,
      gitInfo: gitInfo
    });
  }


  private getTDDFeedback(data: string): Promise<string> {
    const horaActual = new Date().toLocaleTimeString();
    return Promise.resolve(`Hora actual del sistema: ${horaActual}`);
  }

  private async getGitDiff(commitId: string, repoPath: string): Promise<string> {
    if (!/^[0-9a-f]{5,40}$/.test(commitId)) {
      throw new Error("Commit ID inválido");
    }
  
    const git: SimpleGit = simpleGit(repoPath);
  
    try {
      const diff = await git.show([`${commitId}`, '--', 'src/*.test.js', 'src/*.js']);
      return diff;
    } catch (error) {
      console.error('Error al obtener el diff del commit:', error);
      throw new Error('No se pudo obtener el diff del commit');
    }
  }

  private filterDiffLines(diff: string): string[] {
    return diff.split("\n").filter((line: string) =>
      line.startsWith("+") || line.startsWith("-")
    );
  }

  private handleGitError(err: unknown, reject: (reason?: any) => void): void {
    if (err instanceof Error) {
      console.error('Error capturado:', err.message);
      reject('Error al obtener información de Git: ' + err.message);
    } else {
      reject('Error desconocido al obtener información de Git');
    }
  }

  public async fetchResponse() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) return;

    const rootPath = workspaceFolders[0].uri.fsPath;
    const tddLogPath = path.join(rootPath, '/script/tdd_log.json');

    try {
      const tddLogContent = this.readTddLogFile(tddLogPath);
      const tddLogJson = this.parseJson(tddLogContent);
      const gitInfo = {};
      const body = this.createApiRequestBody(tddLogJson, gitInfo);
      const response = await this.getTDDFeedback(body);

      this.handleApiResponse(response);
    } catch (err) {
      this.handleError(err);
    }
  }

  private async getGitInfo(repoPath: string, tddLogJson: any): Promise<any> {
    try {
      const commits = this.filterCommits(tddLogJson);
      if (commits.length === 0) return [];
  
      return await this.getCommitDetails(commits, repoPath);
    } catch (err) {
      this.handleGitError(err, () => {});
      return [];
    }
  }


  private filterCommits(tddLog: any): any[] {
    return tddLog.filter((entry: any) => entry.commitId);
  }

  private async getCommitDetails(commits: any[], repoPath: string): Promise<any[]> {
    const results = [];
  
    for (const entry of commits) {
      const { commitId, commitName, commitTimestamp } = entry;
  
      const diff = await this.getGitDiff(commitId, repoPath);
      const diffLines = this.filterDiffLines(diff);
  
      results.push({
        commitId,
        commitName,
        commitTimestamp,
        resumenDiff: diffLines.join("\n"),
      });
    }
  
    return results;
  }
  

}
