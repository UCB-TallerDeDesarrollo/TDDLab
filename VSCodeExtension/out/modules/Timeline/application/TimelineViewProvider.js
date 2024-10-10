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
class TimelineViewProvider {
    context;
    currentWebview = null;
    timelineRepository;
    timelineService;
    constructor(context) {
        this.context = context;
        this.timelineRepository = new TimelineRepository(context.extensionPath);
        this.timelineService = new TimelineService();
    }
    resolveWebviewView(webviewView) {
        webviewView.webview.options = { enableScripts: true };
        this.currentWebview = webviewView.webview;
        this.showTimeline(webviewView.webview);
    }
    async showTimeline(webview) {
        try {
            const timelines = await this.timelineRepository.getTimelines();
            webview.html = this.timelineService.generateHtml(timelines);
        }
        catch (err) {
            vscode.window.showErrorMessage(`Error al mostrar la línea de tiempo: ${err}`);
        }
    }
}
exports.TimelineViewProvider = TimelineViewProvider;
//# sourceMappingURL=TimelineViewProvider.js.map