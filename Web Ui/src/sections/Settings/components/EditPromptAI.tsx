import { useState, useEffect } from "react";
import { Box, Button, TextField } from "@mui/material";
import "../../../App.css"; 

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
    <Box className="prompt-box-wrapper">
      {!isEditing ? (
        <>
          {/* Cambiamos el TextField por un Box para visualización estable */}
          <Box className="prompt-view-area">
            {initialPrompt}
          </Box>
          
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button 
              className="btn-std btn-primary" 
              onClick={onEdit}
            >
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
            className="prompt-field-edit-fix"
            minRows={8}
            maxRows={16}
            autoFocus
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
            <Button className="btn-std btn-primary" onClick={() => onSave(value)}>
              Guardar
            </Button>
            <Button className="btn-std btn-secondary" onClick={onCancel}>
              Cancelar
            </Button>
            <Button className="btn-std btn-danger" onClick={handleClear}>
              Limpiar
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default EditPromptAI;