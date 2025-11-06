import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';
import { TerminalViewProvider } from '../../presentation/terminal/TerminalViewProvider';
import { TestRunnerPort } from '../../domain/model/TestRunnerPort';

const execPromise = promisify(exec);

export class NpmRunTests implements TestRunnerPort {
  private terminalProvider: TerminalViewProvider;

  constructor(terminalProvider: TerminalViewProvider) {
    this.terminalProvider = terminalProvider;
  }

  async runTests(): Promise<string[]> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      throw new Error('No workspace folder found');
    }

    const cwd = workspaceFolder.uri.fsPath;

    try {
      const { stdout, stderr } = await execPromise('npm run test', {
        cwd,
        maxBuffer: 1024 * 1024 * 10, // 10 MB buffer
      });

      // Enviar salida línea por línea con for...of
      if (stdout) {
        const lines = stdout.split('\n');
        for (const line of lines) {
          this.terminalProvider.sendToTerminal(line);
        }
      }

      // Enviar advertencias si existen
      if (stderr) {
        this.terminalProvider.sendToTerminal('⚠️ Warnings:');
        this.terminalProvider.sendToTerminal(stderr);
      }

      // Analizar resultados de test
      const testResults = this.parseTestResults(stdout);
      return testResults;

    } catch (error: any) {
      // Mostrar salida incluso si ocurre un error
      if (error.stdout) {
        this.terminalProvider.sendToTerminal(error.stdout);
      }
      if (error.stderr) {
        this.terminalProvider.sendToTerminal('❌ Error:');
        this.terminalProvider.sendToTerminal(error.stderr);
      }

      console.error('Error ejecutando npm run test:', error);
      throw error;
    }
  }

  async execute(): Promise<string[]> {
    return this.runTests();
  }

  private parseTestResults(output: string): string[] {
    const results: string[] = [];
    const lines = output.split('\n');

    // Reemplazado forEach por for...of
    for (const line of lines) {
      if (line.includes('PASS') || line.includes('FAIL')) {
        results.push(line.trim());
      }
    }

    // ✅ Usar RegExp.exec() en lugar de String.match()
    if (results.length === 0) {
      const regex = /Tests:\s+(\d+\s+\w+)/;
      const summaryMatch = regex.exec(output);
      if (summaryMatch) {
        results.push(summaryMatch[0]);
      }
    }

    return results.length > 0 ? results : ['Tests ejecutados'];
  }
}
