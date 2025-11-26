import * as vscode from 'vscode';
import { TerminalPort } from '../../domain/model/TerminalPort';
import { spawn } from 'node:child_process';
import * as path from 'node:path';
import * as fs from 'node:fs';

export class VSCodeTerminalRepository implements TerminalPort {
  readonly outputChannel: vscode.OutputChannel;
  private currentProcess: any = null;
  private onOutputCallback: ((output: string) => void) | null = null;
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

  async createAndExecuteCommand(terminalName: string, command: string): Promise<void> {
    if (this.isExecuting) return;
    this.isExecuting = true;

    const trimmed = command.trim();

    // ----------- Manejo de "cd" -----------
    const cdMatch = /^cd\s+(.+)$/.exec(trimmed);
    if (cdMatch) {
      let dir = cdMatch[1].trim();

      if (dir === '..') {
        this.currentDirectory = path.dirname(this.currentDirectory);
      } else {
        dir = dir.replace(/^["']|["']$/g, ''); // quita comillas
        // Si es absoluta, úsala; si no, resuelve respecto al currentDirectory
        const possiblePath = path.isAbsolute(dir)
          ? dir
          : path.resolve(this.currentDirectory, dir);

        try {
          const stat = fs.statSync(possiblePath);
          if (stat.isDirectory()) {
            this.currentDirectory = possiblePath;
          } else {
            if (this.onOutputCallback) {
              this.onOutputCallback(`\r\n❌ ${possiblePath} no es un directorio válido.\r\n`);
            }
          }
        } catch (err) {
          if (this.onOutputCallback) {
            this.onOutputCallback(`\r\n❌ No existe el directorio: ${possiblePath}\r\n`);
          }
        }
      }

      if (this.onOutputCallback) {
        this.onOutputCallback(`\r\nDirectorio actual: ${this.currentDirectory}\r\n`);
        this.onOutputCallback(`\r\n${this.currentDirectory} > `);
      }
      this.isExecuting = false;
      return;
    }

    // ----------- Comando normal, ejecutar en currentDirectory -----------
    const cwd = this.currentDirectory;
    const [cmd, ...args] = this.parseCommand(trimmed);

    return new Promise((resolve) => {
      try {
        this.outputChannel.appendLine(`[${new Date().toISOString()}] Executing: ${trimmed} (cwd: ${cwd})`);

        this.currentProcess = spawn(cmd, args, {
          cwd: cwd,
          shell: true,
          stdio: ['pipe', 'pipe', 'pipe']
        });

        this.currentProcess.stdout?.on('data', (data: Buffer) => {
          const output = data.toString();
          this.outputChannel.append(output);
          if (this.onOutputCallback) {
            this.onOutputCallback(output);
          }
        });

        this.currentProcess.stderr?.on('data', (data: Buffer) => {
          const error = data.toString();
          this.outputChannel.append(error);
          if (this.onOutputCallback) {
            this.onOutputCallback(error);
          }
        });

        this.currentProcess.on('close', (code: number) => {
          this.outputChannel.appendLine(`\nCommand exited with code: ${code}`);
          this.currentProcess = null;
          this.isExecuting = false;

          if (this.onOutputCallback) {
            if (code === 0) {
              this.onOutputCallback(`\r\n✅ Comando ejecutado correctamente\r\n`);
            } else {
              this.onOutputCallback(`\r\n❌ Comando falló con código: ${code}\r\n`);
            }
            this.onOutputCallback(`\r\n${cwd} > `);
          }
          resolve();
        });

        this.currentProcess.on('error', (error: Error) => {
          this.outputChannel.appendLine(`Process error: ${error.message}`);
          this.currentProcess = null;
          this.isExecuting = false;
          if (this.onOutputCallback) {
            this.onOutputCallback(`\r\n❌ Error ejecutando comando: ${error.message}\r\n`);
            this.onOutputCallback(`\r\n${cwd} > `);
          }
          resolve();
        });
      } catch (error: any) {
        this.outputChannel.appendLine(`  ERROR: ${error.message}`);
        this.currentProcess = null;
        this.isExecuting = false;
        if (this.onOutputCallback) {
          this.onOutputCallback(`\r\n❌ Error: ${error.message}\r\n`);
          this.onOutputCallback(`\r\n${cwd} > `);
        }
        resolve();
      }
    });
  }

  private parseCommand(command: string): string[] {
    const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
    const matches = [];
    let match;
    while ((match = regex.exec(command)) !== null) {
      matches.push(match[1] || match[2] || match[0]);
    }
    return matches.length > 0 ? matches : [command];
  }

  public killCurrentProcess(): void {
    const cwd = this.currentDirectory;
    if (this.currentProcess) {
      this.currentProcess.kill('SIGTERM');
      this.currentProcess = null;
      this.isExecuting = false;
      this.outputChannel.appendLine('Process killed by user');
      if (this.onOutputCallback) {
        this.onOutputCallback('\r\n🛑 Proceso cancelado por el usuario\r\n');
        this.onOutputCallback(`\r\n${cwd} > `);
      }
    } else {
      this.isExecuting = false;
      if (this.onOutputCallback) {
        this.onOutputCallback('\r\n🛑 No hay proceso en ejecución\r\n');
        this.onOutputCallback(`\r\n${cwd} > `);
      }
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