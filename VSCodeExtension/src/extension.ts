import * as vscode from 'vscode';
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
    timelineView = new TimelineView(context);
    const terminalPort = new VSCodeTerminalRepository();
    terminalProvider = new TerminalViewProvider(context, timelineView, terminalPort);
    testMenuProvider = new TestMenuProvider();
    const executeCloneCommand = new ExecuteCloneCommand();

    const runTestCmd = vscode.commands.registerCommand('TDD.runTest', async () => {
      try {
        if (!terminalProvider) {
          return vscode.window.showErrorMessage('Terminal no disponible');
        }
        await vscode.commands.executeCommand('tddTerminalView.focus');
        terminalProvider.executeCommand('npm test');
      } catch (error: any) {
        vscode.window.showErrorMessage(`❌ Error ejecutando tests: ${error.message}`);
      }
    });

    const clearTerminalCmd = vscode.commands.registerCommand('TDD.clearTerminal', () => {
      terminalProvider?.clearTerminal();
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
        await timelineView?.forceTimelineUpdate();
        await vscode.commands.executeCommand('tddTerminalView.focus');
      } catch (error: any) {
        vscode.window.showErrorMessage(`Error al mostrar timeline: ${error.message}`);
      }
    });

    const runCypressCmd = vscode.commands.registerCommand('TDD.runCypress', () => {
      vscode.commands.executeCommand('tddTerminalView.focus');
      terminalProvider?.executeCommand('npx cypress run');
    });

    const gitStatusCmd = vscode.commands.registerCommand('TDD.gitStatus', () => {
      vscode.commands.executeCommand('tddTerminalView.focus');
      terminalProvider?.executeCommand('git status');
    });

    const npmInstallCmd = vscode.commands.registerCommand('TDD.npmInstall', () => {
      vscode.commands.executeCommand('tddTerminalView.focus');
      terminalProvider?.executeCommand('npm install');
    });

    context.subscriptions.push(
      runTestCmd,
      clearTerminalCmd,
      cloneProjectCmd,
      showTimelineCmd,
      runCypressCmd,
      gitStatusCmd,
      npmInstallCmd,
      vscode.window.registerTreeDataProvider('tddTestExecution', testMenuProvider),      
      vscode.window.registerWebviewViewProvider(
        TerminalViewProvider.viewType, 
        terminalProvider,
        { webviewOptions: { retainContextWhenHidden: true } }
      ),
      vscode.window.registerWebviewViewProvider(
        TimelineView.viewType, 
        timelineView,
        { webviewOptions: { retainContextWhenHidden: true } }
      )
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