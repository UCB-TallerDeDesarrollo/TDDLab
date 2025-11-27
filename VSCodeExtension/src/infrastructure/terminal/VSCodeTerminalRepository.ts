import * as vscode from 'vscode';
import { TerminalPort } from '../../domain/model/TerminalPort';
import { spawn } from 'node:child_process';

export class VSCodeTerminalRepository implements TerminalPort {
  readonly outputChannel: vscode.OutputChannel;
  private currentProcess: any = null;
  private onOutputCallback: ((output: string) => void) | null = null;
  private isExecuting: boolean = false;

  constructor() {
    this.outputChannel = vscode.window.createOutputChannel('TDDLab Commands');
  }

  setOnOutputCallback(callback: (output: string) => void): void {
    this.onOutputCallback = callback;
  }

  async createAndExecuteCommand(terminalName: string, command: string): Promise<void> {
    if (this.isExecuting) {
      return;
    }

    this.isExecuting = true;

    return new Promise((resolve) => {
      try {
        this.outputChannel.appendLine(`[${new Date().toISOString()}] Executing: ${command}`);
        
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        const cwd = workspaceFolder ? workspaceFolder.uri.fsPath : process.cwd();

        const [cmd, ...args] = this.parseCommand(command);
        
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
          
          // Reset estado
          this.currentProcess = null;
          this.isExecuting = false;
          
          if (this.onOutputCallback) {
            if (code === 0) {
              this.onOutputCallback(`\r\n✅ Comando ejecutado correctamente\r\n`);
            } else {
              this.onOutputCallback(`\r\n❌ Comando falló con código: ${code}\r\n`);
            }
            // ❗ NO ENVIAR PROMPT AQUÍ
          }
          
          resolve();
        });

        this.currentProcess.on('error', (error: Error) => {
          this.outputChannel.appendLine(`Process error: ${error.message}`);
          
          this.currentProcess = null;
          this.isExecuting = false;
          
          if (this.onOutputCallback) {
            this.onOutputCallback(`\r\n❌ Error ejecutando comando: ${error.message}\r\n`);
            // ❗ NO ENVIAR PROMPT AQUÍ
          }
          
          resolve();
        });

      } catch (error: any) {
        this.outputChannel.appendLine(`  ERROR: ${error.message}`);
        
        this.currentProcess = null;
        this.isExecuting = false;
        
        if (this.onOutputCallback) {
          this.onOutputCallback(`\r\n❌ Error: ${error.message}\r\n`);
          // ❗ NO ENVIAR PROMPT AQUÍ
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
    if (this.currentProcess) {
      this.currentProcess.kill('SIGTERM');
      this.currentProcess = null;
      this.isExecuting = false;

      this.outputChannel.appendLine('Process killed by user');

      if (this.onOutputCallback) {
        this.onOutputCallback('\r\n🛑 Proceso cancelado por el usuario\r\n');
      }
    } else {
      // No hay proceso — pero no mandar prompt aquí
      this.isExecuting = false;
      if (this.onOutputCallback) {
        this.onOutputCallback('\r\n🛑 No hay proceso en ejecución\r\n');
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
