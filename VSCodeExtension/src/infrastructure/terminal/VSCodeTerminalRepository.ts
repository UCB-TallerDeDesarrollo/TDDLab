import * as vscode from 'vscode';
import { TerminalPort } from '../../domain/model/TerminalPort';
import { spawn } from 'node:child_process';

export class VSCodeTerminalRepository implements TerminalPort {
  readonly outputChannel: vscode.OutputChannel;
  private currentProcess: any = null;
  private onOutputCallback: ((output: string) => void) | null = null;
  private isExecuting: boolean = false;
  private currentWorkingDirectory: string;

  constructor() {
    this.outputChannel = vscode.window.createOutputChannel('TDDLab Commands');
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    this.currentWorkingDirectory = workspaceFolder ? workspaceFolder.uri.fsPath : process.cwd();
  }

  getCurrentDirectory(): string {
    return this.currentWorkingDirectory;
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
        this.currentWorkingDirectory = cwd;

        const trimmedCommand = command.trim().toLowerCase();
        if (trimmedCommand.startsWith('cd ')) {
          const targetDir = command.trim().substring(3).trim();
          this.handleCdCommand(targetDir, cwd, resolve);
          return;
        }
     
        this.currentProcess = spawn(command, {
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
          if (
            error.includes("bad revision 'HEAD~1'") ||
            error.includes("No se encontró un repositorio remoto") ||
            error.includes("LF will be replaced by CRLF")
          ) {
            return;
          }
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
            this.onOutputCallback(`\r\n${this.currentWorkingDirectory}> `);
          }
          
          resolve();
        });

        this.currentProcess.on('error', (error: Error) => {
          this.outputChannel.appendLine(`Process error: ${error.message}`);
          this.currentProcess = null;
          this.isExecuting = false;
          
          if (this.onOutputCallback) {
            this.onOutputCallback(`\r\n❌ Error ejecutando comando: ${error.message}\r\n> `);
          }
          
          resolve();
        });

      } catch (error: any) {
        this.outputChannel.appendLine(`  ERROR: ${error.message}`);
        this.currentProcess = null;
        this.isExecuting = false;
        
        if (this.onOutputCallback) {
          this.onOutputCallback(`\r\n❌ Error: ${error.message}\r\n> `);
        }
        
        resolve();
      }
    });
  }

  private handleCdCommand(targetDir: string, currentCwd: string, resolve: () => void): void {
    const path = require('node:path');
    
    try {
      let newDir: string;
      
      if (targetDir === '~') {
        newDir = require('node:os').homedir();
      } else if (targetDir === '..') {
        newDir = path.dirname(this.currentWorkingDirectory);
      } else if (path.isAbsolute(targetDir)) {
        newDir = targetDir;
      } else {
        newDir = path.resolve(this.currentWorkingDirectory, targetDir);
      }

      const fs = require('node:fs');
      if (fs.existsSync(newDir) && fs.statSync(newDir).isDirectory()) {
        this.currentWorkingDirectory = newDir;
        this.outputChannel.appendLine(`Changed directory to: ${newDir}`);
        
        if (this.onOutputCallback) {
          this.onOutputCallback(`\r\n${this.currentWorkingDirectory}> `);
        }
      } else {
        if (this.onOutputCallback) {
          this.onOutputCallback(`\r\n❌ El directorio no existe: ${targetDir}\r\n${this.currentWorkingDirectory}> `);
        }
      }
    } catch (error: any) {
      if (this.onOutputCallback) {
        this.onOutputCallback(`\r\n❌ Error cambiando directorio: ${error.message}\r\n${this.currentWorkingDirectory}> `);
      }
    }
    
    this.isExecuting = false;
    resolve();
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
        this.onOutputCallback('\r\n🛑 Proceso cancelado por el usuario\r\n> ');
      }
    } else {
      this.isExecuting = false;
      if (this.onOutputCallback) {
        this.onOutputCallback('\r\n🛑 No hay proceso en ejecución\r\n> ');
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

  public writeToTerminal(data: string): void {
    if (this.currentProcess?.stdin?.writable) {
      try {
        // Verificar que data no esté vacío
        if (!data || data.length === 0) {
          return;
        }
        
        const code = data.codePointAt(0);
        
        // Si code es undefined, salir
        if (code === undefined) {
          return;
        }
        
        // Manejo especial para teclas importantes
        switch (code) {
          case 13: // Enter - enviar nueva línea
            this.currentProcess.stdin.write('\n');
            break;
          case 127: // Backspace - enviar Ctrl+H (backspace ASCII)
            this.currentProcess.stdin.write('\x08');
            break;
          case 3: // Ctrl+C - enviar señal de interrupción
            this.currentProcess.stdin.write('\x03');
            break;
          case 9: // Tab
            this.currentProcess.stdin.write('\t');
            break;
          case 27: // Escape - podría ser inicio de secuencia (como flechas)
            // Para flechas, necesitamos más lógica, pero por ahora ignorar
            break;
          default:
            // Caracteres normales
            if (data && data.length === 1 && code >= 32 && code <= 126) {
              this.currentProcess.stdin.write(data);
            }
            break;
        }
      } catch (error) {
        console.error('Error writing to stdin:', error);
        // Si hay error escribiendo, probablemente el proceso terminó
        this.currentProcess = null;
        this.isExecuting = false;
      }
    } else if (this.isExecuting) {
      // Si estamos en estado de ejecución pero no hay stdin, resetear estado
      this.isExecuting = false;
      console.warn('Intento de escribir en stdin pero el proceso no está disponible');
    }
  }
}