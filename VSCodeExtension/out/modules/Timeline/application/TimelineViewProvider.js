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
exports.TimelineViewProvider = void 0;
const vscode = __importStar(require("vscode"));
const TimelineRepository_1 = require("../repository/TimelineRepository");
class TimelineViewProvider {
    context;
    currentWebview = null;
    timelineRepository;
    constructor(context) {
        this.context = context;
        this.timelineRepository = new TimelineRepository_1.TimelineRepository(context.extensionPath);
    }
    resolveWebviewView(webviewView) {
        webviewView.webview.options = { enableScripts: true };
        this.currentWebview = webviewView.webview;
        this.showTimeline(webviewView.webview);
    }
    async showTimeline(webview) {
        try {
            const timelines = await this.timelineRepository.getTimelines();
            webview.html = this.generateHtml(timelines);
        }
        catch (err) {
            if (err instanceof Error) {
                vscode.window.showErrorMessage(`Error al mostrar la línea de tiempo: ${err.message}`);
            }
            else {
                vscode.window.showErrorMessage(`Error desconocido al mostrar la línea de tiempo`);
            }
        }
    }
    generateHtml(timelines) {
        const timelineHtml = timelines.map(item => {
            const color = item.isSuccessful() ? "green" : "red";
            return `<div style="margin: 3px; background-color: ${color}; width: 25px; height: 25px; border-radius: 50px;"></div>`;
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
                <h2>Línea de Tiempo</h2>
                <div style="display: flex; flex-wrap: wrap;">
                    ${timelineHtml}
                </div>
            </body>
            </html>
        `;
    }
}
exports.TimelineViewProvider = TimelineViewProvider;
//# sourceMappingURL=TimelineViewProvider.js.map