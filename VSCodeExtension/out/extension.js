"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(require("vscode"));
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    const timelineViewProvider = new TimelineViewProvider(context);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('timelineView', timelineViewProvider));
    vscode.commands.registerCommand('extension.showTimeline', () => {
        vscode.commands.executeCommand('workbench.view.extension.timelineContainer');
        vscode.window.showInformationMessage('Vista web recargada correctamente.');
    });
}
class TimelineViewProvider {
    context;
    constructor(context) {
        this.context = context;
    }
    resolveWebviewView(webviewView) {
        webviewView.webview.options = {
            enableScripts: true
        };
        this.showTimeline(webviewView.webview);
    }
    showTimeline(webview) {
        const jsonData = [
            { color: "rojo", time: "2024-09-17" },
            { color: "verde", time: "2024-09-18" },
            { color: "rojo", time: "2024-09-19" },
            { color: "verde", time: "2024-09-22" },
            { color: "rojo", time: "2024-09-21" },
            { color: "verde", time: "2024-09-22" }
        ];
        webview.html = getWebviewContent(jsonData);
    }
}
function getWebviewContent(jsonData) {
    const timelineHtml = jsonData.map(item => {
        const color = item.color === "rojo" ? "red" : "green";
        return `<div style="margin: 10px; background-color: ${color}; width: 30px; height: 30px;"></div>`;
    }).join('');
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Línea de Tiempo</title>
        </head>
        <body>
            <h1>Línea de Tiempo</h1>
            <div style="display:flex;">
                ${timelineHtml}
            </div>
        </body>
        </html>
    `;
}
// This method is called when your extension is deactivated
function deactivate() { }
//# sourceMappingURL=extension.js.map