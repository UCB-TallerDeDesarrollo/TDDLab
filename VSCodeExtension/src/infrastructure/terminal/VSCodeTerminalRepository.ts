import * as vscode from 'vscode';
import { TerminalPort } from '../../domain/model/TerminalPort';
import { spawn } from 'node:child_process';

export class VSCodeTerminalRepository implements TerminalPort {
  readonly outputChannel: vscode.OutputChannel;
  private currentProcess: any = null;
  private onOutputCallback: ((output: string) => void) | null = null;
  private isExecuting: boolean = false;
  private currentWorkingDirectory: string; // ✅ NUEVA PROPIEDAD

  constructor() {
    this.outputChannel = vscode.window.createOutputChannel('TDDLab Commands');
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    this.currentWorkingDirectory = workspaceFolder ? workspaceFolder.uri.fsPath : process.cwd();
  }
   // ✅ NUEVO MÉTODO para obtener el directorio actual
  getCurrentDirectory(): string {
    return this.currentWorkingDirectory;
  }

  setOnOutputCallback(callback: (output: string) => void): void {
    this.onOutputCallback = callback;
  }

  async createAndExecuteCommand(terminalName: string, command: string): Promise<void> {
    // Si ya está ejecutando, no hacer nada
    if (this.isExecuting) {
      return;
    }

    this.isExecuting = true;

    return new Promise((resolve) => {
      try {
        this.outputChannel.appendLine(`[${new Date().toISOString()}] Executing: ${command}`);
        
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        const cwd = workspaceFolder ? workspaceFolder.uri.fsPath : process.cwd();

          // ✅ Actualizar el directorio actual
        this.currentWorkingDirectory = cwd;

        // ✅ Detectar comandos que cambian de directorio
        const trimmedCommand = command.trim().toLowerCase();
        if (trimmedCommand.startsWith('cd ')) {
          // Manejar el comando cd especialmente
          const targetDir = command.trim().substring(3).trim();
          this.handleCdCommand(targetDir, cwd, resolve);
          return;
        }

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
          
          // IMPORTANTE: Resetear estado ANTES de enviar callbacks
          this.currentProcess = null;
          this.isExecuting = false;
          
          if (this.onOutputCallback) {
            this.onOutputCallback(`\r\n${this.currentWorkingDirectory}$ `);
          }
          
          resolve();
        });

        this.currentProcess.on('error', (error: Error) => {
          this.outputChannel.appendLine(`Process error: ${error.message}`);
          
          // IMPORTANTE: Resetear estado ANTES de enviar callbacks
          this.currentProcess = null;
          this.isExecuting = false;
          
          if (this.onOutputCallback) {
            this.onOutputCallback(`\r\n❌ Error ejecutando comando: ${error.message}\r\n$ `);
          }
          
          resolve();
        });

      } catch (error: any) {
        this.outputChannel.appendLine(`  ERROR: ${error.message}`);
        
        // IMPORTANTE: Resetear estado en caso de excepción
        this.currentProcess = null;
        this.isExecuting = false;
        
        if (this.onOutputCallback) {
          this.onOutputCallback(`\r\n❌ Error: ${error.message}\r\n$ `);
        }
        
        resolve();
      }
    });
  }
   // ✅ NUEVO MÉTODO para manejar el comando cd
  private handleCdCommand(targetDir: string, currentCwd: string, resolve: () => void): void {
    const path = require('node:path');
    
    try {
      // Resolver la ruta target
      let newDir: string;
      
      if (targetDir === '~') {
        // Directorio home
        newDir = require('node:os').homedir();
      } else if (targetDir === '..') {
        // Directorio padre
        newDir = path.dirname(this.currentWorkingDirectory);
      } else if (path.isAbsolute(targetDir)) {
        // Ruta absoluta
        newDir = targetDir;
      } else {
        // Ruta relativa
        newDir = path.resolve(this.currentWorkingDirectory, targetDir);
      }

      // Verificar si el directorio existe
      const fs = require('node:fs');
      if (fs.existsSync(newDir) && fs.statSync(newDir).isDirectory()) {
        this.currentWorkingDirectory = newDir;
        this.outputChannel.appendLine(`Changed directory to: ${newDir}`);
        
        if (this.onOutputCallback) {
          this.onOutputCallback(`\r\n${this.currentWorkingDirectory}$ `);
        }
      } else {
        if (this.onOutputCallback) {
          this.onOutputCallback(`\r\n❌ El directorio no existe: ${targetDir}\r\n${this.currentWorkingDirectory}$ `);
        }
      }
    } catch (error: any) {
      if (this.onOutputCallback) {
        this.onOutputCallback(`\r\n❌ Error cambiando directorio: ${error.message}\r\n${this.currentWorkingDirectory}$ `);
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
        this.onOutputCallback('\r\n🛑 Proceso cancelado por el usuario\r\n$ ');
      }
    } else {
      // Si no hay proceso pero isExecuting está true, resetearlo
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
}