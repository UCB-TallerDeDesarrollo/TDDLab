import * as vscode from 'vscode';
import { ExecutionButton } from '../../modules/Button/model/ExecutionButton';
import * as fs from 'fs';
import * as path from 'path';

export class ExecutionTreeDataProvider implements vscode.TreeDataProvider<ExecutionButton> {
  private features: { [key: string]: boolean } = {};

  constructor(private readonly context: vscode.ExtensionContext) {
    this.loadFeatureConfig(context);
  }

  private loadFeatureConfig(context: vscode.ExtensionContext): void {
  try {
    const extensionFolder = context.globalStorageUri.fsPath;
    const storagePath = path.join(extensionFolder, 'VSCodeExtensionFeatures.json');

    let rawData: string;

    rawData = fs.readFileSync(storagePath, 'utf8');
    

    this.features = JSON.parse(rawData);
  } catch (error) {
    console.error('Error al cargar VSCodeExtensionFeatures.json:', error);
  }
}

  getTreeItem(element: ExecutionButton): vscode.TreeItem {
    return element;
  }

  getChildren(element?: ExecutionButton): Thenable<ExecutionButton[]> {
    const buttons: ExecutionButton[] = [];

    if (this.features.runTest) {
      buttons.push(new ExecutionButton(
        'Run Test',
        vscode.TreeItemCollapsibleState.None,
        { command: 'TDD.runTest', title: 'Run Test' },
        '',
        new vscode.ThemeIcon('play', new vscode.ThemeColor('charts.green')),
        'Execute TDD Tests'
      ));
    }

    if (this.features.crearProyecto) {
      buttons.push(new ExecutionButton(
        'Crear Proyecto',
        vscode.TreeItemCollapsibleState.None,
        { command: 'TDD.cloneCommand', title: 'Crear Proyecto' },
        '',
        new vscode.ThemeIcon('window', new vscode.ThemeColor('charts.white')),
        ''
      ));
    }

    if (this.features.asistenteIA) {
      buttons.push(new ExecutionButton(
        'Asistente de IA',
        vscode.TreeItemCollapsibleState.None,
        { command: 'TDD.AsistenteCommand', title: 'Asistente de IA' },
        '',
        new vscode.ThemeIcon('symbol-method', new vscode.ThemeColor('charts.white')),
        ''
      ));
    }

    if (this.features.exportarSesion) {
      buttons.push(new ExecutionButton(
        'Exportar sesion TDDLab',
        vscode.TreeItemCollapsibleState.None,
        { command: 'TDD.exportCommand', title: 'Exportar sesion TDDLab' },
        '',
        new vscode.ThemeIcon('arrow-down', new vscode.ThemeColor('charts.white')),
        ''
      ));
    }

    return Promise.resolve(buttons);
  }
  
}

export class ExecutionTreeView {
  private readonly treeView: vscode.TreeView<ExecutionButton>;
  private readonly treeDataProvider: ExecutionTreeDataProvider;

  constructor(private readonly context: vscode.ExtensionContext) {
    this.treeDataProvider = new ExecutionTreeDataProvider(context);
    this.treeView = vscode.window.createTreeView('tddTestExecution', {
      treeDataProvider: this.treeDataProvider
    });
  }

  initialize(): void {
    this.context.subscriptions.push(this.treeView);
  }
}