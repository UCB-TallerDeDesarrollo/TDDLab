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
    // If already executing, don't do anything
    if (this.isExecuting) {
      if (this.onOutputCallback) {
        this.onOutputCallback('\r\n⚠️  Ya hay un comando en ejecución\r\n$ ');
      }
      return;
    }

    this.isExecuting = true;

    return new Promise((resolve) => {
      try {
        // 🔒 SECURITY: Basic command validation
        if (!this.isCommandBasicSafe(command)) {
          this.outputChannel.appendLine(`[SECURITY BLOCKED] ${command}`);
          this.isExecuting = false;
          if (this.onOutputCallback) {
            this.onOutputCallback('\r\n❌ Comando rechazado por seguridad\r\n$ ');
          }
          resolve();
          return;
        }

        this.outputChannel.appendLine(`[${new Date().toISOString()}] Executing: ${command}`);
        
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        const cwd = workspaceFolder ? workspaceFolder.uri.fsPath : process.cwd();

        // Use shell: true to access all system commands and PATH
        this.currentProcess = spawn(command, {
          cwd: cwd,
          shell: true, // Allows access to all system commands and PATH
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: 60000, // 60 second timeout for longer processes
          windowsHide: true
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
          
          // IMPORTANT: Reset state BEFORE sending callbacks
          this.currentProcess = null;
          this.isExecuting = false;
          
          if (this.onOutputCallback) {
            if (code === 0) {
              this.onOutputCallback(`\r\n✅ Comando ejecutado correctamente\r\n`);
            } else {
              this.onOutputCallback(`\r\n❌ Comando falló con código: ${code}\r\n`);
            }
            // Send prompt AFTER resetting state
            this.onOutputCallback('$ ');
          }
          
          resolve();
        });

        this.currentProcess.on('error', (error: Error) => {
          this.outputChannel.appendLine(`Process error: ${error.message}`);
          
          // IMPORTANT: Reset state BEFORE sending callbacks
          this.currentProcess = null;
          this.isExecuting = false;
          
          if (this.onOutputCallback) {
            this.onOutputCallback(`\r\n❌ Error ejecutando comando: ${error.message}\r\n$ `);
          }
          
          resolve();
        });

        // Handle process timeout
        setTimeout(() => {
          if (this.currentProcess && this.isExecuting) {
            this.outputChannel.appendLine('Command timed out');
            this.killCurrentProcess();
            if (this.onOutputCallback) {
              this.onOutputCallback('\r\n⏰ Comando excedió el tiempo límite\r\n$ ');
            }
          }
        }, 60000);

      } catch (error: any) {
        this.outputChannel.appendLine(`  ERROR: ${error.message}`);
        
        // IMPORTANT: Reset state in case of exception
        this.currentProcess = null;
        this.isExecuting = false;
        
        if (this.onOutputCallback) {
          this.onOutputCallback(`\r\n❌ Error: ${error.message}\r\n$ `);
        }
        
        resolve();
      }
    });
  }

  // 🔒 SECURITY: Basic safety checks without restricting commands
  private isCommandBasicSafe(command: string): boolean {
    if (!command || command.trim().length === 0) {
      return false;
    }

    // Block only extremely dangerous patterns
    const dangerousPatterns = [
      />\s*\/dev\/|\|\s*\/dev\//, // Redirection to device files
    ];

    // Warning for potentially dangerous commands (but allow them)
    const warningPatterns = [
      /\b(rm\s+-?rf?|del\s+\/s|format|chmod\s+[0-7]{3,4}\s+)\b/i,
    ];

    if (dangerousPatterns.some(pattern => pattern.test(command))) {
      return false;
    }

    // Log warnings but allow the command
    if (warningPatterns.some(pattern => pattern.test(command))) {
      this.outputChannel.appendLine(`[SECURITY WARNING] Potentially dangerous command: ${command}`);
      // You could also show a warning to the user if desired
      if (this.onOutputCallback) {
        this.onOutputCallback('\r\n⚠️  Advertencia: Comando potencialmente peligroso\r\n');
      }
    }

    return true;
  }

  public killCurrentProcess(): void {
    if (this.currentProcess) {
      // Try SIGTERM first, then SIGKILL if needed
      this.currentProcess.kill('SIGTERM');
      
      setTimeout(() => {
        if (this.currentProcess) {
          this.currentProcess.kill('SIGKILL');
        }
      }, 5000);
      
      this.currentProcess = null;
      this.isExecuting = false;
      this.outputChannel.appendLine('Process killed by user');
      if (this.onOutputCallback) {
        this.onOutputCallback('\r\n🛑 Proceso cancelado por el usuario\r\n$ ');
      }
    } else {
      // If no process but isExecuting is true, reset it
      this.isExecuting = false;
      if (this.onOutputCallback) {
        this.onOutputCallback('\r\n🛑 No hay proceso en ejecución\r\n$ ');
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

  // Helper method to get system information - FIXED VARIABLE NAME
  public async getSystemInfo(): Promise<string> {
    return new Promise((resolve) => {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      const cwd = workspaceFolder ? workspaceFolder.uri.fsPath : process.cwd();
      
      // FIX: Changed variable name from 'process' to 'shellProcess' to avoid conflict
      const shellProcess = spawn('echo', ['$SHELL'], {
        cwd: cwd,
        shell: true,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      shellProcess.stdout?.on('data', (data: Buffer) => {
        output += data.toString();
      });

      shellProcess.on('close', () => {
        resolve(output.trim() || 'Unknown shell');
      });
    });
  }
}