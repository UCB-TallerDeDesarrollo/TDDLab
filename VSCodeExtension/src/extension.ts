import * as vscode from 'vscode';
import { TimelineViewProvider } from './modules/Timeline/application/TimelineViewProvider ';

/**
 * @param {vscode.ExtensionContext} context
 */
export function activate(context: vscode.ExtensionContext) {
    const timelineViewProvider = new TimelineViewProvider(context);
    
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('timelineView', timelineViewProvider)
    );

    vscode.commands.registerCommand('extension.showTimeline', () => {
        vscode.commands.executeCommand('workbench.view.extension.timelineContainer');

        if (timelineViewProvider.currentWebview) {
            timelineViewProvider.showTimeline(timelineViewProvider.currentWebview);
        }
    });
}

// This method is called when your extension is deactivated
export function deactivate() {}
