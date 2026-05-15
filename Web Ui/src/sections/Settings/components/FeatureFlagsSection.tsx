import { useState } from "react";
import { Box, FormControlLabel, Switch, Typography } from "@mui/material";
import { ConfirmationDialog } from "../../Shared/Components";
import { FeatureFlag } from "../../../modules/FeatureFlags/domain/FeatureFlag";

interface FeatureFlagsSectionProps {
  flags: FeatureFlag[];
  onToggle: (id: number, current: boolean) => void;
}

const FeatureFlagsSection = ({ flags, onToggle }: FeatureFlagsSectionProps) => {
  const [pendingFlag, setPendingFlag] = useState<{ id: number; current: boolean } | null>(null);

  const handleSwitchChange = (id: number, current: boolean) => {
    setPendingFlag({ id, current });
  };

  const handleConfirm = () => {
    if (pendingFlag) {
      onToggle(pendingFlag.id, pendingFlag.current);
      setPendingFlag(null);
    }
  };

  const handleCancel = () => {
    setPendingFlag(null);
  };

  return (
    <>
      <Typography variant="h5" sx={{ mt: 4, mb: 1 }}>
        Habilitación de Funcionalidades
      </Typography>

      {flags.map((flag) => (
        <Box key={flag.id} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={flag.is_enabled}
                onChange={() => handleSwitchChange(flag.id, flag.is_enabled)}
              />
            }
            label={flag.feature_name}
          />
        </Box>
      ))}

      <ConfirmationDialog
        open={pendingFlag !== null}
        title="Cambiar funcionalidad"
        content={`¿Estás seguro de que quieres ${pendingFlag?.current ? "deshabilitar" : "habilitar"} esta funcionalidad?`}
        cancelText="Cancelar"
        deleteText="Confirmar"
        onCancel={handleCancel}
        onDelete={handleConfirm}
      />
    </>
  );
};

export default FeatureFlagsSection;
