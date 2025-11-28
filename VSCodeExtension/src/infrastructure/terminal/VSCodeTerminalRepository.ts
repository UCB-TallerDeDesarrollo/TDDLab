import * as vscode from 'vscode';
import { TerminalPort } from '../../domain/model/TerminalPort';
import { spawn, ChildProcess } from 'node:child_process';

export class VSCodeTerminalRepository implements TerminalPort {
  readonly outputChannel: vscode.OutputChannel;
  private currentProcess: ChildProcess | null = null;
  private onOutputCallback: ((output: string) => void) | null = null;
  private onCommandCompleteCallback: (() => void) | null = null;
  private isExecuting: boolean = false;

  constructor() {
    this.outputChannel = vscode.window.createOutputChannel('TDDLab Commands');
  }

  setOnOutputCallback(callback: (output: string) => void): void {
    this.onOutputCallback = callback;
  }

  setOnCommandCompleteCallback(callback: () => void): void {
    this.onCommandCompleteCallback = callback;
  }

  async createAndExecuteCommand(terminalName: string, command: string): Promise<void> {
    if (this.isExecuting) {
      vscode.window.showWarningMessage('Ya hay un comando en ejecución.');
      return;
    }

    this.isExecuting = true;

    return new Promise((resolve) => {
      try {
        this.outputChannel.appendLine(`[${new Date().toISOString()}] Executing: ${command}`);

        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        const cwd = workspaceFolder ? workspaceFolder.uri.fsPath : process.cwd();

        const [cmd, ...args] = this.parseCommand(command);

        // Forzar salida con colores ANSI
        const env = { ...process.env, FORCE_COLOR: 'true' };

        this.currentProcess = spawn(cmd, args, {
          cwd: cwd,
          shell: true,
          stdio: ['pipe', 'pipe', 'pipe'],
          env: env,
        });

        this.currentProcess.stdout?.on('data', (data: Buffer) => {
          const output = data.toString();
          this.outputChannel.append(output);
          if (this.onOutputCallback) {
            const text = data.toString();
            this.onOutputCallback('\r\n' + text);
          }
        });

        this.currentProcess.stderr?.on('data', (data: Buffer) => {
          const error = data.toString();
          this.outputChannel.append(error);
          if (this.onOutputCallback) {
            const text = data.toString();
            this.onOutputCallback('\r\n' + error + '\r\n' + text);
          }
        });

        const handleExit = (code: number | null, signal: string | null) => {
            if (this.currentProcess === null) return; // Ya se ha gestionado

            this.outputChannel.appendLine(`\nCommand exited with code: ${code}, signal: ${signal}`);

            this.currentProcess = null;
            this.isExecuting = false;

            if (this.onCommandCompleteCallback) {
                this.onCommandCompleteCallback();
            }

            resolve();
        };

        this.currentProcess.on('close', handleExit);
        this.currentProcess.on('error', (error: Error) => {
            if (this.currentProcess === null) return;

            this.outputChannel.appendLine(`Process error: ${error.message}`);
            if (this.onOutputCallback) {
                this.onOutputCallback(`\r\n❌ Error ejecutando comando: ${error.message}\r\n`);
            }
            handleExit(null, 'error');
        });

      } catch (error: any) {
        this.outputChannel.appendLine(`  ERROR: ${error.message}`);
        if (this.onOutputCallback) {
          this.onOutputCallback(`\r\n❌ Error: ${error.message}\r\n`);
        }
        this.currentProcess = null;
        this.isExecuting = false;
        if (this.onCommandCompleteCallback) {
            this.onCommandCompleteCallback();
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
    if (this.currentProcess && !this.currentProcess.killed) {
      this.currentProcess.kill('SIGKILL'); // Usar SIGKILL para forzar la terminación
      this.currentProcess = null;
      this.isExecuting = false;

      this.outputChannel.appendLine('Process killed by user');

      if (this.onOutputCallback) {
        this.onOutputCallback('\r\n🛑 Proceso cancelado por el usuario.');
      }
      // El callback onCommandComplete se llamará desde el evento 'close'
    } else {
      this.isExecuting = false;
      if (this.onOutputCallback) {
        this.onOutputCallback('\r\n🛑 No hay proceso en ejecución.');
      }
      if (this.onCommandCompleteCallback) {
        this.onCommandCompleteCallback();
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

// Añadimos la nueva función al interfaz
declare module '../../domain/model/TerminalPort' {
    interface TerminalPort {
        setOnCommandCompleteCallback(callback: () => void): void;
    }
}
