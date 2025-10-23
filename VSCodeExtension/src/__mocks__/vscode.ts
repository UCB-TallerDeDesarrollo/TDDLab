// src/presentation/__mocks__/vscode.ts

export const window = {
  showOpenDialog: jest.fn(),
  showWarningMessage: jest.fn(),
  showInformationMessage: jest.fn(),
  showErrorMessage: jest.fn(),
  createWebviewPanel: jest.fn(),
  createOutputChannel: jest.fn(() => ({
    appendLine: jest.fn(),
    clear: jest.fn(),
    dispose: jest.fn(),
    show: jest.fn(),
  })),
  createTerminal: jest.fn(),
  activeTextEditor: undefined,
  showTextDocument: jest.fn(),
};

export const workspace = {
  getConfiguration: jest.fn(() => ({
    get: jest.fn(),
    update: jest.fn(),
    has: jest.fn(),
  })),
  workspaceFolders: [
    {
      uri: { fsPath: '/mock/workspace/path', path: '/mock/workspace/path' },
      name: 'MockWorkspace',
      index: 0,
    },
  ],
  openTextDocument: jest.fn(),
  getWorkspaceFolder: jest.fn(),
  onDidChangeConfiguration: jest.fn(),
  onDidChangeWorkspaceFolders: jest.fn(),
};

export const Uri = {
  file: jest.fn((path: string) => ({ 
    fsPath: path, 
    path,
    scheme: 'file',
    authority: '',
    query: '',
    fragment: '',
  })),
  parse: jest.fn((path: string) => ({
    fsPath: path,
    path,
    scheme: 'file',
    authority: '',
    query: '',
    fragment: '',
  })),
  joinPath: jest.fn((base: any, ...paths: string[]) => ({
    fsPath: `${base.fsPath}/${paths.join('/')}`,
    path: `${base.path}/${paths.join('/')}`,
    scheme: 'file',
    authority: '',
    query: '',
    fragment: '',
  })),
};

export const ViewColumn = {
  Active: -1,
  Beside: -2,
  One: 1,
  Two: 2,
  Three: 3,
  Four: 4,
  Five: 5,
  Six: 6,
  Seven: 7,
  Eight: 8,
  Nine: 9,
};

export const commands = {
  registerCommand: jest.fn(),
  executeCommand: jest.fn(),
};

// ⭐ AGREGAR TreeItem
export class TreeItem {
  label: string;
  collapsibleState?: number;
  command?: any;
  iconPath?: any;
  contextValue?: string;

  constructor(label: string, collapsibleState?: number) {
    this.label = label;
    this.collapsibleState = collapsibleState;
  }
}

export const TreeItemCollapsibleState = {
  None: 0,
  Collapsed: 1,
  Expanded: 2,
};

export class EventEmitter<T> {
  private listeners: Array<(e: T) => any> = [];

  event = (listener: (e: T) => any) => {
    this.listeners.push(listener);
    return { dispose: () => {} };
  };

  fire(data: T) {
    this.listeners.forEach(listener => listener(data));
  }

  dispose() {
    this.listeners = [];
  }
}

export default {
  window,
  workspace,
  Uri,
  ViewColumn,
  commands,
  TreeItem,
  TreeItemCollapsibleState,
  EventEmitter,
};