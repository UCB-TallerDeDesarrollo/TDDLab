import * as vscode from 'vscode';
import * as path from 'path';
import { TerminalViewProvider } from './presentation/terminal/TerminalViewProvider';
import { TimelineView } from './presentation/timeline/TimelineView';
import { TestMenuProvider } from './presentation/menu/TestMenuProvider';
import { VSCodeTerminalRepository } from './infrastructure/terminal/VSCodeTerminalRepository';
import { ExecuteCloneCommand } from './application/clone/ExecuteCloneCommand';

let terminalProvider: TerminalViewProvider | null = null;
let timelineView: TimelineView | null = null;
let testMenuProvider: TestMenuProvider | null = null;

export async function activate(context: vscode.ExtensionContext) {
  console.log('TDDLab extension is activating...');

  try {
    // Crear TimelineView primero
    timelineView = new TimelineView(context);

    // Crear VSCodeTerminalRepository
    const terminalPort = new VSCodeTerminalRepository();

    // Crear TerminalViewProvider con TimelineView
    terminalProvider = new TerminalViewProvider(context, timelineView, terminalPort);

    // Crear el menú de opciones TDD
    testMenuProvider = new TestMenuProvider();

    // Crear instancia para clonar proyectos
    const executeCloneCommand = new ExecuteCloneCommand();

    // Verificar si hay una instalación pendiente
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (workspaceFolder) {
      const markerFile = path.join(workspaceFolder, '.tddlab-setup-pending');
      try {
        const fs = await import('node:fs/promises');
        const markerExists = await fs.access(markerFile).then(() => true).catch(() => false);

        if (markerExists) {
          // Esperar un poco para que la ventana se cargue completamente
          setTimeout(async () => {
            await vscode.window.withProgress({
              location: vscode.ProgressLocation.Notification,
              title: 'Configurando proyecto TDDLab...',
              cancellable: false
            }, async (progress) => {
              try {
                // Abrir la terminal TDD
                await vscode.commands.executeCommand('tddTerminalView.focus');

                // Ejecutar npm install
                progress.report({ increment: 0, message: 'Instalando dependencias...' });
                if (terminalProvider) {
                  terminalProvider.sendToTerminal('\r\n🔧 Configuración automática iniciada...\r\n');
                  terminalProvider.sendToTerminal('$ npm install\r\n');
                  await terminalPort.createAndExecuteCommand('TDDLab Setup', 'npm install');
                }

                // Ejecutar git init
                progress.report({ increment: 50, message: 'Inicializando Git...' });
                if (terminalProvider) {
                  terminalProvider.sendToTerminal('\r\n$ git init\r\n');
                  await terminalPort.createAndExecuteCommand('TDDLab Setup', 'git init');

                  terminalProvider.sendToTerminal('\r\n$ git add .\r\n');
                  await terminalPort.createAndExecuteCommand('TDDLab Setup', 'git add .');

                  terminalProvider.sendToTerminal('\r\n$ git commit -m "Initial commit"\r\n');
                  await terminalPort.createAndExecuteCommand('TDDLab Setup', 'git commit -m "Initial commit"');
                }

                // Eliminar el archivo marcador
                await fs.unlink(markerFile);

                progress.report({ increment: 100, message: '¡Completado!' });

                if (terminalProvider) {
                  terminalProvider.sendToTerminal('\r\n✅ Proyecto configurado correctamente\r\n');
                  terminalProvider.sendToTerminal('Puedes ejecutar: npm test\r\n$ ');
                }

                vscode.window.showInformationMessage('✅ Proyecto TDDLab configurado correctamente');
              } catch (error: any) {
                console.error('Error en setup automático:', error);
                vscode.window.showErrorMessage(`Error en configuración automática: ${error.message}`);
                if (terminalProvider) {
                  terminalProvider.sendToTerminal(`\r\n❌ Error: ${error.message}\r\n$ `);
                }
              }
            });
          }, 2000);
        }
      } catch (error: any) {
        console.error('Error verificando archivo marcador:', error);
      }
    }

    // === Comandos principales ===

    const runTestCmd = vscode.commands.registerCommand('TDD.runTest', async () => {
      try {
        if (!terminalProvider) {
          vscode.window.showErrorMessage('Terminal no disponible');
          return;
        }
        await vscode.commands.executeCommand('tddTerminalView.focus');
        terminalProvider.executeCommand('npm test');
      } catch (error: any) {
        const msg = `❌ Error ejecutando tests: ${error.message}`;
        vscode.window.showErrorMessage(msg);
      }
    });

    const clearTerminalCmd = vscode.commands.registerCommand('TDD.clearTerminal', () => {
      if (terminalProvider) {
        terminalProvider.clearTerminal();
      }
    });

    const cloneProjectCmd = vscode.commands.registerCommand('TDD.cloneCommand', async () => {
      try {
        await executeCloneCommand.execute();
      } catch (error: any) {
        vscode.window.showErrorMessage(`Error al crear el proyecto: ${error.message}`);
      }
    });

    const showTimelineCmd = vscode.commands.registerCommand('extension.showTimeline', async () => {
      try {
        await vscode.commands.executeCommand('tddTerminalView.focus');
      } catch (error: any) {
        vscode.window.showErrorMessage(`Error al mostrar timeline: ${error.message}`);
      }
    });

    const runCypressCmd = vscode.commands.registerCommand('TDD.runCypress', () => {
      if (terminalProvider) {
        vscode.commands.executeCommand('tddTerminalView.focus');
        terminalProvider.executeCommand('npx cypress run');
      }
    });

    const gitStatusCmd = vscode.commands.registerCommand('TDD.gitStatus', () => {
      if (terminalProvider) {
        vscode.commands.executeCommand('tddTerminalView.focus');
        terminalProvider.executeCommand('git status');
      }
    });

    const npmInstallCmd = vscode.commands.registerCommand('TDD.npmInstall', () => {
      if (terminalProvider) {
        vscode.commands.executeCommand('tddTerminalView.focus');
        terminalProvider.executeCommand('npm install');
      }
    });

    // Unificada en una sola llamada push()
    context.subscriptions.push(
      runTestCmd,
      clearTerminalCmd,
      cloneProjectCmd,
      showTimelineCmd,
      runCypressCmd,
      gitStatusCmd,
      npmInstallCmd,
      vscode.window.registerTreeDataProvider('tddTestExecution', testMenuProvider),
      vscode.window.registerWebviewViewProvider(TerminalViewProvider.viewType, terminalProvider)
    );

    console.log('TDDLab extension activated ✅');
  } catch (error: any) {
    console.error('Error activating TDDLab extension:', error);
    vscode.window.showErrorMessage(`Error activating TDDLab: ${error.message}`);
  }
}

export function deactivate() {
  terminalProvider = null;
  timelineView = null;
  testMenuProvider = null;
}
