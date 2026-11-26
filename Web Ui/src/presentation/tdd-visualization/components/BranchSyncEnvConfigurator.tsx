import axios from "axios";
import { useState } from "react";
import { VITE_API } from "../../../../config";

interface BranchSyncCredentials {
  TDD_SYNC_URL: string;
  TDD_SYNC_TOKEN: string;
}

interface SaveFileHandle {
  createWritable(): Promise<{
    write(contents: string): Promise<void>;
    close(): Promise<void>;
  }>;
}

type WindowWithSavePicker = Window & {
  showSaveFilePicker?: (options: { suggestedName: string }) => Promise<SaveFileHandle>;
};

function environmentFile(credentials: BranchSyncCredentials) {
  return `TDD_SYNC_URL=${credentials.TDD_SYNC_URL}\nTDD_SYNC_TOKEN=${credentials.TDD_SYNC_TOKEN}\n`;
}

async function saveEnvironmentFile(contents: string) {
  const pickerWindow = window as WindowWithSavePicker;
  if (pickerWindow.showSaveFilePicker) {
    const file = await pickerWindow.showSaveFilePicker({ suggestedName: ".env" });
    const writable = await file.createWritable();
    await writable.write(contents);
    await writable.close();
    return true;
  }

  const url = URL.createObjectURL(new Blob([contents], { type: "text/plain" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = ".env";
  link.click();
  URL.revokeObjectURL(url);
  return false;
}

export default function BranchSyncEnvConfigurator({
  owner,
  repoName,
}: Readonly<{ owner: string; repoName: string }>) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const createEnvironmentFile = async () => {
    setLoading(true);
    setMessage("");
    setIsError(false);
    try {
      const response = await axios.post<BranchSyncCredentials>(
        `${VITE_API}/TDDCycles/sync/credentials`,
        { repository: { provider: "github", owner, name: repoName } },
        { withCredentials: true },
      );
      const credentials = response.data;
      if (!credentials?.TDD_SYNC_URL || !credentials?.TDD_SYNC_TOKEN) {
        throw new Error("El backend no devolvió credenciales de sincronización válidas.");
      }

      const savedToSelectedLocation = await saveEnvironmentFile(environmentFile(credentials));
      setMessage(savedToSelectedLocation
        ? "Archivo .env guardado. Selecciona la raíz del proyecto donde ejecutas npm test."
        : "Archivo .env descargado. Muévelo a la raíz del proyecto donde ejecutas npm test.");
    } catch (error) {
      setIsError(true);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setMessage("Inicia sesión en TDDLab para crear el archivo .env.");
      } else if (axios.isAxiosError(error) && error.response?.status === 403) {
        setMessage("Tu cuenta no está autorizada para sincronizar este repositorio.");
      } else if (axios.isAxiosError(error) && error.response?.status === 503) {
        setMessage("El backend todavía no tiene configurada la entrega de credenciales.");
      } else {
        setMessage(error instanceof Error ? error.message : "No se pudo crear el archivo .env.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <button
        type="button"
        onClick={createEnvironmentFile}
        disabled={loading}
        style={{
          margin: "12px auto",
          border: 0,
          borderRadius: 8,
          padding: "10px 18px",
          background: loading ? "#64748B" : "#0F766E",
          color: "#fff",
          fontSize: 14,
          fontWeight: 700,
          cursor: loading ? "wait" : "pointer",
        }}
      >
        {loading ? "Creando .env…" : "Crear .env para sincronizar pruebas"}
      </button>
      {message && <p role={isError ? "alert" : "status"} style={{ textAlign: "center", margin: 0 }}>{message}</p>}
    </div>
  );
}
