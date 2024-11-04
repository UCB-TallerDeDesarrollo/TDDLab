import * as vscode from 'vscode';

export class GetLastPoint {
    private context: vscode.ExtensionContext;
    private statusBarItem: vscode.StatusBarItem;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;

        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000);
        this.statusBarItem.show();
        this.context.subscriptions.push(this.statusBarItem);       
    }

    execute(status_point: string) {
        let point = '🔴';
        let text = 'Último test fallido';
        if(status_point === 'green') {
            point = '🟢';
            text = 'Último test pasado';
        }
        this.statusBarItem.text = point;
        this.statusBarItem.tooltip = text;
        this.statusBarItem.show();
    }

}