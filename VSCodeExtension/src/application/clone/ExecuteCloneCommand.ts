import * as vscode from 'vscode';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export class ExecuteCloneCommand {
  constructor(private readonly extensionPath: string) {}

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

      // Copiar la plantilla incluida con la extensión para conservar su versión de sincronización.
      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Creando proyecto TDDLab...",
        cancellable: false
      }, async (progress) => {
        progress.report({ increment: 0, message: "Preparando la plantilla..." });

        try {
          const templateFolder = path.join(this.extensionPath, 'resources', 'TDDLabBaseProject');
          if (!(await fs.stat(path.join(templateFolder, 'package.json')).catch(() => null))) {
            throw new Error('No se encontró la plantilla TDDLab incluida con la extensión.');
          }

          progress.report({ increment: 40, message: "Copiando archivos..." });

          const templateFiles = await fs.readdir(templateFolder);
          const shouldCopy = (sourcePath: string) => {
            const relativePath = path.relative(templateFolder, sourcePath).split(path.sep).join('/');
            return relativePath !== '.git' &&
              relativePath !== '.env' &&
              !/^\.env\..+\.local$/.test(relativePath) &&
              relativePath !== 'script/pending-sync.json';
          };
          
          for (const file of templateFiles) {
            if (file !== '.git' && file !== '.env' && file !== 'node_modules') {
              const srcPath = path.join(templateFolder, file);
              const destPath = path.join(selectedPath, file);
              await fs.cp(srcPath, destPath, { recursive: true, filter: shouldCopy });
            }
          }

          progress.report({ increment: 80, message: "Finalizando la configuración..." });

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
