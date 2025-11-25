import * as vscode from 'vscode';
import { TerminalPort } from '../../domain/model/TerminalPort';
import { spawn } from 'node:child_process';

export class VSCodeTerminalRepository implements TerminalPort {
  readonly outputChannel: vscode.OutputChannel;
  private currentProcess: any = null;
  private onOutputCallback: ((output: string) => void) = () => {};
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

        // SOLUCIÓN ROBUSTA: Usar shell nativo según el SO
        const shell = process.platform === 'win32' ? 'cmd.exe' : '/bin/bash';
        const shellFlag = process.platform === 'win32' ? '/c' : '-c';

        this.currentProcess = spawn(shell, [shellFlag, command], {
          cwd: cwd,
          stdio: ['pipe', 'pipe', 'pipe'],
          windowsVerbatimArguments: process.platform === 'win32'
        });

        this.currentProcess.stdout?.on('data', (data: Buffer) => {
          const output = data.toString();
          this.outputChannel.append(output);
          this.onOutputCallback(output); // Ya no es null
        });

        this.currentProcess.stderr?.on('data', (data: Buffer) => {
          const error = data.toString();
          this.outputChannel.append(`ERROR: ${error}`);
          this.onOutputCallback(error); // Ya no es null
        });

        this.currentProcess.on('close', (code: number) => {
          this.outputChannel.appendLine(`\nCommand exited with code: ${code}`);
          
          this.currentProcess = null;
          this.isExecuting = false;
          
          setTimeout(() => {
            if (code === 0) {
              this.onOutputCallback(`\r\n✅ Comando ejecutado correctamente\r\n`);
            } else {
              this.onOutputCallback(`\r\n❌ Comando falló con código: ${code}\r\n`);
            }
            this.onOutputCallback('\r\n$ ');
          }, 50);
          
          resolve();
        });

        this.currentProcess.on('error', (error: Error) => {
          this.outputChannel.appendLine(`Process error: ${error.message}`);
          
          this.currentProcess = null;
          this.isExecuting = false;
          
          this.onOutputCallback(`\r\n❌ Error ejecutando comando: ${error.message}\r\n$ `);
          resolve();
        });

      } catch (error: any) {
        this.outputChannel.appendLine(`  ERROR: ${error.message}`);
        
        this.currentProcess = null;
        this.isExecuting = false;
        
        this.onOutputCallback(`\r\n❌ Error: ${error.message}\r\n$ `);
        resolve();
      }
    });
  }

  // Eliminar parseCommand ya que no es necesario con el nuevo enfoque
  public killCurrentProcess(): void {
    if (this.currentProcess) {
      this.currentProcess.kill('SIGTERM');
      this.currentProcess = null;
      this.isExecuting = false;
      this.outputChannel.appendLine('Process killed by user');
      this.onOutputCallback('\r\n🛑 Proceso cancelado por el usuario\r\n$ ');
    } else {
      this.isExecuting = false;
      this.onOutputCallback('\r\n🛑 No hay proceso en ejecución\r\n$ ');
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