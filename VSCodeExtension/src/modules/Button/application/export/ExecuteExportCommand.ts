import * as vscode from 'vscode';
import * as dotenv from 'dotenv'; 
import * as fs from 'fs'; 
import * as CryptoJS from 'crypto-js'; 
import * as path from 'path';
import AdmZip from 'adm-zip';

export class ExecuteExportCommand {
  key: string = '';
  constructor(){
    dotenv.config({ path: path.resolve(__dirname, '../../../../../.env' )});
    this.key = process.env.CLAVE_ENCRIPTACION || '';
  }

  private async selectFolder(): Promise<string | undefined>{
    const folderUri = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: 'Seleccionar carpeta'
    });
  
    if (!folderUri || folderUri.length === 0) {
      vscode.window.showErrorMessage('No se seleccionó ninguna carpeta.');
      return undefined;
    }

    return folderUri[0].fsPath; 
  }

  private async getFileName(): Promise<string | undefined> {

    const fileName = await vscode.window.showInputBox({
      prompt: 'Ingresa el nombre del archivo (sin extensión)',
      validateInput: (input: string) => {
        if (!input || input.trim() === '') {
          return 'El nombre del archivo no puede estar vacío.';
        }
        if (/[^a-zA-Z0-9_\-]/.test(input)) {
          return 'El nombre del archivo solo puede contener letras, números, guiones y guiones bajos.';
        }
        return null;
      }
    });

    if (!fileName) {
      vscode.window.showErrorMessage('No se ingresó un nombre para el archivo.');
      return undefined;
    }

    return `${fileName}.zip`;
  }

  private compressFile(sourceFile: string, destinationFile: string): void{
    try {
      const zip = new AdmZip();
      zip.addLocalFile(sourceFile);
      zip.writeZip(destinationFile);
    } catch (error){
      console.error('Error en la compresion:', error);
    }
  }

  private encryptFile(sourceFile: string, destinationFile: string): void {
    try {
      const binaryData = fs.readFileSync(sourceFile);
      const base64Data = binaryData.toString('base64');
      const encryptedContent = CryptoJS.AES.encrypt(base64Data, this.key).toString();
      fs.writeFileSync(destinationFile, encryptedContent, 'utf8');
    } catch (error) {
      console.error('Error en la encriptación:', error);
    }
  }

  async execute(): Promise<void> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    const tddLogPath = `${workspaceFolder}/script/tdd_log.json`;

    if(!fs.existsSync(tddLogPath)){
      vscode.window.showErrorMessage('No existe un registro de pruebas.');
      return;
    }

      
    const folderPath = await this.selectFolder();
    if(!folderPath){
      return;
    }

    const fileName = await this.getFileName();
    if(!fileName){
      return;
    }

    const destinationPath = path.join(folderPath, fileName);

    if(fs.existsSync(destinationPath)){
      vscode.window.showWarningMessage(`El archivo '${fileName}' ya existe en la carpeta seleccionada.`);
      return;
    } 
      
    this.compressFile(tddLogPath, destinationPath);
    this.encryptFile(destinationPath, destinationPath);
    vscode.window.showInformationMessage(`TDD Data exportado correctamente en: ${destinationPath}`);
  }
}