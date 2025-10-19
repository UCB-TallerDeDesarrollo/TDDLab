import JSZip from "jszip";
import CryptoJS from "crypto-js";
import { VITE_API, VITE_DECRYPTION_KEY } from "../../../../config";



export const UploadTDDLogFile = async (
    file: File, 
    repositoryLink?: string,
    repoOwner?: string,
    repoName?: string

): Promise<void> => {
  try {
    const reader = new FileReader();

    reader.onload = async () => {
      const encryptedContent = reader.result as string;
      const binaryData = decryptContent(encryptedContent, VITE_DECRYPTION_KEY);
      const fileContent = await extractFileFromZip(binaryData, "tdd_log.json");
      const jsonData = parseJSON(fileContent);

      const updatedData = repositoryLink
        ? enrichWithRepoData(jsonData, repositoryLink)
        : { repoName, repoOwner, log: jsonData };
    
      console.log("JSON actualizado:", updatedData);
      const response = await fetch(`${VITE_API}/TDDCycles/upload-log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error(`Error en el POST: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log("Respuesta de la API:", responseData);
    };

    reader.readAsText(file);
  } catch (error) {
    console.error("Error al procesar el archivo:", error);
    throw error;
  }
};

const decryptContent = (encryptedContent: string, decryptionKey: string): Uint8Array => {
  const decryptedBytes = CryptoJS.AES.decrypt(encryptedContent, decryptionKey);
  const base64Data = decryptedBytes.toString(CryptoJS.enc.Utf8);
  if (!base64Data) throw new Error("Error al desencriptar");
  return Uint8Array.from(atob(base64Data), (char) => char.charCodeAt(0));
};

const extractFileFromZip = async (binaryData: Uint8Array, targetFileName: string): Promise<string> => {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(binaryData);
  const targetFile = loadedZip.file(targetFileName);
  if (!targetFile) throw new Error(`Archivo ${targetFileName} no encontrado en el ZIP.`);
  return targetFile.async("string");
};

const parseJSON = (fileContent: string): any => {
  try {
    return JSON.parse(fileContent);
  } catch {
    throw new Error("Error al parsear el JSON.");
  }
};

const enrichWithRepoData = (jsonData: any, repoLink?: string) => {
  if (!repoLink) throw new Error("Enlace del repositorio no proporcionado.");
  
  const regex = /https:\/\/github\.com\/([^/]+)\/([^/]+)/;
  const repoMatch = regex.exec(repoLink); // Cambio realizado: usamos regex.exec().

  if (!repoMatch) throw new Error("Enlace del repositorio inválido.");
  return { repoName: repoMatch[2], repoOwner: repoMatch[1], log: jsonData };
};
