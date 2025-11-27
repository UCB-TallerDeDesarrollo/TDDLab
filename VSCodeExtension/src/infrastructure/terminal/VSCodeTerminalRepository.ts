// src/infrastructure/terminal/VSCodeTerminalRepository.ts
import * as vscode from 'vscode';
import { TerminalPort } from '../../domain/model/TerminalPort';
import { spawn } from 'node:child_process';
import * as path from 'node:path';
import * as fs from 'node:fs';

export class VSCodeTerminalRepository implements TerminalPort {
  readonly outputChannel: vscode.OutputChannel;
  private currentProcess: any = null;
  private onOutputCallback: ((output: string) => void) = () => {};
  private isExecuting: boolean = false;
  private currentDirectory: string;

  constructor() {
    this.outputChannel = vscode.window.createOutputChannel('TDDLab Commands');
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    this.currentDirectory = workspaceFolder ? workspaceFolder.uri.fsPath : process.cwd();
  }

  setOnOutputCallback(callback: (output: string) => void): void {
    this.onOutputCallback = callback;
  }

  private printPrompt() {
    this.onOutputCallback(`\r\n${this.currentDirectory} > `);
  }

  async createAndExecuteCommand(terminalName: string, command: string): Promise<void> {
    if (this.isExecuting) return;
    this.isExecuting = true;

    const trimmed = command.trim();

    if (!trimmed || trimmed.endsWith('>')) {
      this.isExecuting = false;
      this.printPrompt();
      return;
    }

    if (trimmed === 'clear') {
      this.outputChannel.clear();
      this.onOutputCallback('\x1Bc');
      this.isExecuting = false;
      this.printPrompt();
      return;
    }

    const cdMatch = /^cd\s+(.+)$/.exec(trimmed);
    if (cdMatch) {
      let dir = cdMatch[1].trim();

      if (dir === '..') {
        this.currentDirectory = path.dirname(this.currentDirectory);
      } else {
        dir = dir.replaceAll(/^["']|["']$/g, '');
        const possiblePath = path.isAbsolute(dir)
          ? dir
          : path.resolve(this.currentDirectory, dir);

        try {
          const stat = fs.statSync(possiblePath);
          if (stat.isDirectory()) {
            this.currentDirectory = possiblePath;
          } else {
            this.onOutputCallback(`\r\n❌ ${possiblePath} no es un directorio válido.\r\n`);
          }
        } catch (err) {
          this.onOutputCallback(`\r\n❌ No existe el directorio: ${possiblePath}\r\n`);
        }
      }

      this.isExecuting = false;
      this.printPrompt();
      return;
    }

    const cwd = this.currentDirectory;
    const parsed = this.parseCommand(trimmed);

    if (parsed.length === 0 || !parsed[0]) {
      this.isExecuting = false;
      this.printPrompt();
      return;
    }

    const [cmd, ...args] = parsed;

    return new Promise((resolve) => {
      try {
        this.outputChannel.appendLine(`[${new Date().toISOString()}] Executing: ${trimmed} (cwd: ${cwd})`);

        this.currentProcess = spawn(cmd, args, {
          cwd,
          stdio: ['pipe', 'pipe', 'pipe'],
          shell: true
        });

        this.currentProcess.stdout?.on('data', (data: Buffer) => {
          const output = data.toString();
          this.outputChannel.append(output);
          this.onOutputCallback(output);
        });

        this.currentProcess.stderr?.on('data', (data: Buffer) => {
          const error = data.toString();
          this.outputChannel.append(`ERROR: ${error}`);
          this.onOutputCallback(error);
        });

        this.currentProcess.on('close', (code: number) => {
          this.outputChannel.appendLine(`\nCommand exited with code: ${code}`);

          this.currentProcess = null;
          this.isExecuting = false;

          if (code === 0) {
            this.onOutputCallback(`\r\n✅ Comando ejecutado correctamente\r\n`);
          } else {
            this.onOutputCallback(`\r\n❌ Comando falló con código: ${code}\r\n`);
          }

          this.printPrompt();
          resolve();
        });

        this.currentProcess.on('error', (error: Error) => {
          this.outputChannel.appendLine(`Process error: ${error.message}`);

          this.currentProcess = null;
          this.isExecuting = false;

          this.onOutputCallback(`\r\n❌ Error ejecutando comando: ${error.message}\r\n`);
          this.printPrompt();
          resolve();
        });

      } catch (error: any) {
        this.outputChannel.appendLine(`  ERROR: ${error.message}`);

        this.currentProcess = null;
        this.isExecuting = false;

        this.onOutputCallback(`\r\n❌ Error: ${error.message}\r\n`);
        this.printPrompt();
        resolve();
      }
    });
  }

  private parseCommand(command: string): string[] {
    const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(command)) !== null) {
      matches.push(match[1] || match[2] || match[0]);
    }
    return matches;
  }

  public killCurrentProcess(): void {
    if (this.currentProcess) {
      this.currentProcess.kill('SIGTERM');
      this.currentProcess = null;
      this.isExecuting = false;
      this.outputChannel.appendLine('Process killed by user');

      this.onOutputCallback('\r\n🛑 Proceso cancelado por el usuario\r\n');
      this.printPrompt();
    } else {
      this.isExecuting = false;
      this.onOutputCallback('\r\n🛑 No hay proceso en ejecución\r\n');
      this.printPrompt();
    }
  }

  public getIsExecuting(): boolean {
    return this.isExecuting;
  }

  public dispose(): void {
    this.killCurrentProcess();
    this.outputChannel.dispose();
  }
}