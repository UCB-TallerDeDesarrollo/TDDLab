import { useEffect, useState } from "react";
import axios from "axios";
import { VITE_API } from "../../../config";

type FeatureFlag = {
  id: number;
  feature_name: string;
  is_enabled: boolean;
};

export default function ConfigPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        const response = await axios.get(`${VITE_API}/featureflags`);
        setFlags(response.data);
      } catch (err) {
        console.error("Error al cargar los flags", err);
        setError("Error al cargar los flags");
      }
    };

    fetchFlags();
  }, []);

  const handleCheckboxChange = async (id: number, currentValue: boolean) => {
    try {
      const updated = await axios.put(`${VITE_API}/featureflags/${id}`, {
        is_enabled: !currentValue,
      });

      setFlags((prevFlags) =>
        prevFlags.map((flag) =>
          flag.id === id ? { ...flag, is_enabled: updated.data.is_enabled } : flag
        )
      );
    } catch (err) {
      console.error("Error al actualizar el flag", err);
      setError("Error al actualizar el flag");
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Configuración de Funcionalidades</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {flags.map((flag) => (
        <div key={flag.id} style={{ marginBottom: "10px" }}>
          <label>
            <input
              type="checkbox"
              checked={flag.is_enabled}
              onChange={() => handleCheckboxChange(flag.id, flag.is_enabled)}
            />
            {flag.feature_name}
          </label>
        </div>
      ))}
    </div>
  );
}
