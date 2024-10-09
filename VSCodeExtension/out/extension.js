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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    const timelineViewProvider = new TimelineViewProvider(context);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('timelineView', timelineViewProvider));
    vscode.commands.registerCommand('extension.showTimeline', () => {
        vscode.commands.executeCommand('workbench.view.extension.timelineContainer');
        if (timelineViewProvider.currentWebview) {
            timelineViewProvider.showTimeline(timelineViewProvider.currentWebview);
        }
    });
}
class TimelineViewProvider {
    context;
    currentWebview = null;
    constructor(context) {
        this.context = context;
    }
    resolveWebviewView(webviewView) {
        webviewView.webview.options = {
            enableScripts: true
        };
        this.currentWebview = webviewView.webview;
        this.showTimeline(webviewView.webview);
    }
    showTimeline(webview) {
        const jsonFilePath = path.join(this.context.extensionPath, 'src', 'data.json');
        fs.readFile(jsonFilePath, 'utf8', (err, data) => {
            if (err) {
                vscode.window.showErrorMessage(`Error al leer el archivo JSON: ${err.message}`);
                return;
            }
            try {
                const jsonData = JSON.parse(data);
                webview.html = getWebviewContent(jsonData);
            }
            catch (parseError) {
                vscode.window.showErrorMessage(`Error al parsear el archivo JSON`);
            }
        });
    }
}
function getWebviewContent(jsonData) {
    vscode.window.showInformationMessage('Vista web recargada correctamente.');
    const timelineHtml = jsonData.map(item => {
        const color = item.numPassedTests === item.numTotalTests ? "green" : "red";
        // const color = item.resultado === "fallida" ? "red" : "green";
        return `<div style="margin: 3px; background-color: ${color}; width: 25px; height: 25px; border-radius: 50px";></div>`;
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
            <h2 style="margin-bottom: 1px">Línea de Tiempo</h2>
            <div style="display:flex; flex-wrap: wrap; margin-top: 0px">
                ${timelineHtml}
            </div>
        </body>
        </html>
    `;
}
// This method is called when your extension is deactivated
function deactivate() { }
//# sourceMappingURL=extension.js.map