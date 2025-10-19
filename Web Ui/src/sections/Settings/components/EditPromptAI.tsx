import { useState, useEffect } from "react";
import { Box, Button, TextField } from "@mui/material";

interface EditPromptAIProps {
  initialPrompt: string;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (value: string) => void;
  onCancel: () => void;
}

const EditPromptAI = ({
  initialPrompt,
  isEditing,
  onEdit,
  onSave,
  onCancel,
}: EditPromptAIProps) => {
  const [value, setValue] = useState(initialPrompt);

  useEffect(() => {
    setValue(initialPrompt);
  }, [initialPrompt]);

  const handleClear = () => setValue("");

  return (
    <Box sx={{ mt: 4, mb: 8, p: 2, background: "#fff", borderRadius: 2, boxShadow: 1 }}>
      {!isEditing ? (
        <>
          <TextField
            value={initialPrompt}
            multiline
            fullWidth
            InputProps={{
              readOnly: true,
              style: { background: "#f9f9f9" }
            }}
            variant="outlined"
            minRows={8} 
            maxRows={16}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
            <Button variant="contained" onClick={onEdit}>
              Editar Prompt
            </Button>
          </Box>
        </>
      ) : (
        <>
          <TextField
            value={value}
            onChange={e => setValue(e.target.value)}
            multiline
            fullWidth
            variant="outlined"
            minRows={8} 
            maxRows={16}
            autoFocus
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1 }}>
            <Button variant="contained" color="primary" onClick={() => onSave(value)}>
              Guardar
            </Button>
            <Button variant="contained" color="primary" onClick={onCancel}>
              Cancelar
            </Button>
            <Button variant="contained" color="primary" onClick={handleClear}>
              Limpiar
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default EditPromptAI;