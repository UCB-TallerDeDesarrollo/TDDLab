import * as vscode from 'vscode';

export class GetLastPoint {
    private readonly context: vscode.ExtensionContext;
    private readonly statusBarItem: vscode.StatusBarItem;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;

        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 9999);
        this.statusBarItem.show();
        this.context.subscriptions.push(this.statusBarItem);       
        this.statusBarItem.command = 'extension.showTimeline';
    }

    execute(status_point: string) {
        let point = '🔴';
        let text = 'Último test fallido';
        if(status_point === 'green') {
            point = '🟢';
            text = 'Último test pasado';
       }
        this.statusBarItem.text = `${point} TDDLAB`; 
        this.statusBarItem.tooltip = text;
        this.statusBarItem.show();
    }

}