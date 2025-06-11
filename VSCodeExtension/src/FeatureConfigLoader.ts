import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export class FeatureConfigLoader {
    static load(context: vscode.ExtensionContext): { [key: string]: boolean } {
        try {
            const configPath = path.join(context.extensionPath, 'resources', 'features.json');
            const rawData = fs.readFileSync(configPath, 'utf8');
            return JSON.parse(rawData);
        } catch (error) {
            console.error('Error al cargar features.json:', error);
            return {};
        }
    }
}
