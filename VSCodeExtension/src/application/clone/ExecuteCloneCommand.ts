import * as vscode from 'vscode';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export class ExecuteCloneCommand {
  // URL del repositorio base TDDLab
  private readonly REPO_URL = 'https://github.com/UCB-TallerDeDesarrollo/TDDLabBaseProject.git';

  async execute(): Promise<void> {
    try {
      // Verificar si Git está instalado
      try {
        await execAsync('git --version');
      } catch (error) {
        console.error('Error al verificar Git:', error);
         vscode.window.showErrorMessage(
    ' Git no está instalado. Por favor, instala Git primero: https://git-scm.com/'
  );
  return;
      }

      // Abrir diálogo para seleccionar carpeta donde crear el proyecto
      const folderUri = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: 'Seleccionar carpeta para crear el proyecto',
        title: 'Crear Proyecto TDDLab'
      });

      if (!folderUri || folderUri.length === 0) {
        vscode.window.showWarningMessage('No se seleccionó ninguna carpeta.');
        return;
      }

      const selectedPath = folderUri[0].fsPath;

      // Verificar si la carpeta está vacía
      const files = await fs.readdir(selectedPath);
      if (files.length > 0) {
        const overwrite = await vscode.window.showWarningMessage(
          'La carpeta seleccionada no está vacía. Los archivos del proyecto base se agregarán aquí. ¿Deseas continuar?',
          'Sí',
          'No'
        );
        
        if (overwrite !== 'Sí') {
          return;
        }
      }

      // Clonar el repositorio con barra de progreso
      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Creando proyecto TDDLab...",
        cancellable: false
      }, async (progress) => {
        progress.report({ increment: 0, message: "Creando repositorio..." });

        try {
          // Crear carpeta temporal para el clone
          const tempFolder = path.join(selectedPath, '.temp-tddlab-clone');
          
          // Clonar en carpeta temporal
          await execAsync(`git clone ${this.REPO_URL} "${tempFolder}"`);

          progress.report({ increment: 40, message: "Copiando archivos..." });

          // Mover todos los archivos de la carpeta temporal a la carpeta seleccionada
          const clonedFiles = await fs.readdir(tempFolder);
          
          for (const file of clonedFiles) {
            if (file !== '.git') {
              const srcPath = path.join(tempFolder, file);
              const destPath = path.join(selectedPath, file);
              await fs.cp(srcPath, destPath, { recursive: true });
            }
          }

          progress.report({ increment: 80, message: "Limpiando archivos temporales..." });

          // Eliminar carpeta temporal
          await fs.rm(tempFolder, { recursive: true, force: true });

          // Crear archivo marcador para instalación automática
          const markerFile = path.join(selectedPath, '.tddlab-setup-pending');
          await fs.writeFile(markerFile, JSON.stringify({
            createdAt: new Date().toISOString(),
            needsInstall: true,
            needsGitInit: true
          }));

          progress.report({ increment: 100, message: "¡Completado!" });
        } catch (error: any) {
          throw new Error(`Error al clonar: ${error.message}`);
        }
      });

      // Abrir el proyecto en una nueva ventana de VS Code inmediatamente
      const selectedPathUri = vscode.Uri.file(selectedPath);
      await vscode.commands.executeCommand('vscode.openFolder', selectedPathUri, true);

    } catch (error: any) {
      vscode.window.showErrorMessage(
        `❌ Error al crear el proyecto: ${error.message}`
      );
      console.error('Error completo:', error);
    }
  }
}