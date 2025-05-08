import { useEffect, useState } from "react";

import { GetFeatureFlags } from "../../modules/FeatureFlags/application/GetFeatureFlags";
import { FeatureFlag } from "../../modules/FeatureFlags/domain/FeatureFlag";
import { UpdateFeatureFlag } from "../../modules/FeatureFlags/application/UpdateFeatureFlag";
export default function ConfigPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [error, setError] = useState<string | null>(null);

  const getFlagsUseCase = new GetFeatureFlags();
  const updateFlagUseCase = new UpdateFeatureFlag();

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        const data = await getFlagsUseCase.execute();
        setFlags(data);
      } catch (err) {
        console.error("Error al cargar los flags", err);
        setError("Error al cargar los flags");
      }
    };

    fetchFlags();
  }, []);

  const handleCheckboxChange = async (id: number, currentValue: boolean) => {
    const confirmChange = window.confirm(
      `¿Estás seguro de que quieres ${!currentValue ? "habilitar" : "deshabilitar"} esta funcionalidad?`
    );
    if (!confirmChange) return;

    try {
      const updatedFlag = await updateFlagUseCase.execute(id, !currentValue);
      setFlags((prevFlags) =>
        prevFlags.map((flag) =>
          flag.id === id ? updatedFlag : flag
        )
      );
    } catch (err) {
      console.error("Error al actualizar el flag", err);
      setError("Error al actualizar el flag");
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Habilitación de Funcionalidades</h2>
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