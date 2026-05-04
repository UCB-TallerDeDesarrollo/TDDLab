import { useState, useEffect } from "react";
import { Button, TextField } from "@mui/material";
import './EditPromptAI.css';

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
    <div className="edit-prompt-container">
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
          <div className="edit-prompt-actions">
            <Button variant="contained" onClick={onEdit}>
              Editar Prompt
            </Button>
          </div>
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
          <div className="edit-prompt-actions--editing">
            <Button variant="contained" color="primary" onClick={() => onSave(value)}>
              Guardar
            </Button>
            <Button variant="contained" color="primary" onClick={onCancel}>
              Cancelar
            </Button>
            <Button variant="contained" color="primary" onClick={handleClear}>
              Limpiar
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default EditPromptAI;