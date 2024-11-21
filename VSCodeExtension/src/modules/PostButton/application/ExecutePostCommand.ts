import * as vscode from 'vscode';
import { TerminalPort } from '../../../model/TerminalPort';
import { promises as fs } from 'fs';

export class ExecutePostCommand {
  constructor(private readonly terminalPort: TerminalPort) {}

  async execute(): Promise<void> {

    //esta fucnion todavi no esta terminado debido a que no existe un url

    const url = "";
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;

    if (!workspaceFolder) {
      vscode.window.showErrorMessage('No se ha encontrado un espacio de trabajo abierto.');
      return;
    }

    const filePath = `${workspaceFolder}/script/tdd_log.json`;

    try{ 

      const fileContent = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(fileContent);

      vscode.window.showErrorMessage(JSON.stringify(JSON.parse(fileContent), null, 2));

      // const fetch = (await import('node-fetch')).default;

      // const response = await fetch(url, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json'},
      //   body: JSON.stringify(data),
      // });

      // if (!response.ok) {
      //   vscode.window.showErrorMessage(`Error en la solicitud: ${response.statusText}`);
      //   return;
      // }

      // const result = await response.json();
      // vscode.window.showInformationMessage('Solicitud POST realizada con éxito');
      // console.log(result);

    } catch (error: any){
      vscode.window.showErrorMessage(`Error al hacer POST: ${error.message}`);
    }
    
  }
}