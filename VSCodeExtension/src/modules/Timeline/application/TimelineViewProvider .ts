import * as vscode from 'vscode';
import { TimelineRepository } from '../repository/TimelineRepository';
import { ShowTimeline } from './ShowTimeline';

export class TimelineViewProvider implements vscode.WebviewViewProvider {
    private context: vscode.ExtensionContext;
    public currentWebview: vscode.Webview | null = null;
    private timelineRepository: TimelineRepository;
    private timelineService: ShowTimeline;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.timelineRepository = new TimelineRepository(context.extensionPath);
        this.timelineService = new ShowTimeline();
    }

    resolveWebviewView(webviewView: vscode.WebviewView): void {
        webviewView.webview.options = { enableScripts: true };
        this.currentWebview = webviewView.webview;
        this.showTimeline(webviewView.webview);
    }

    async showTimeline(webview: vscode.Webview): Promise<void> {
        try {
            const timelines = await this.timelineRepository.getTimelines();
            webview.html = this.timelineService.generateHtml(timelines);
        } catch (err) {
            if (err instanceof Error) {
                vscode.window.showErrorMessage(`Error al mostrar la línea de tiempo: ${err.message}`);
            } else {
                vscode.window.showErrorMessage(`Error desconocido al mostrar la línea de tiempo`);
            }
        }
    }
}
