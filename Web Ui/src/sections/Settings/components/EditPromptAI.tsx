import { useState, useEffect } from 'react';
import { Typography, Button, TextField, Box, Paper, Divider } from '@mui/material';

interface EditPromptAIProps {
  initialPrompt: string;
  title: string;
  isEditing: boolean;
  onSave: (prompt: string) => void;
  onCancel: () => void;
  onEdit: () => void;
}

const EditPromptAI = ({ 
  initialPrompt, 
  title, 
  isEditing, 
  onSave, 
  onCancel, 
  onEdit 
}: EditPromptAIProps) => {
  const [prompt, setPrompt] = useState<string>(initialPrompt);

  useEffect(() => {
    setPrompt(initialPrompt);
  }, [initialPrompt]);

  const handleSave = () => {
    onSave(prompt);
  };

  const handleClear = () => {
    setPrompt('');
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography
          variant="h5"
          component="h2"
        >
          {title}
        </Typography>
        {!isEditing && (
          <Button
            variant="outlined"
            color="error"
            onClick={() => setPrompt('')}
            sx={{ textTransform: 'none' }}
          >
            Limpiar
          </Button>
        )}
      </Box>
      <Divider sx={{ mb: 2 }} />
      
      {isEditing ? (
        <>
          <TextField
            fullWidth
            multiline
            rows={10}
            variant="outlined"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            sx={{ mb: 3 }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={onCancel}
              sx={{ textTransform: 'none' }}
            >
              Cancelar
            </Button>
            <Button
              variant="outlined"
              onClick={handleClear}
              sx={{ textTransform: 'none' }}
            >
              Limpiar
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              sx={{ textTransform: 'none' }}
            >
              Guardar
            </Button>
          </Box>
        </>
      ) : (
        <>
          <Box 
            sx={{ 
              p: 2, 
              border: '1px solid #e0e0e0', 
              borderRadius: 1, 
              mb: 2,
              minHeight: '150px',
              whiteSpace: 'pre-wrap',
              backgroundColor: '#f9f9f9'
            }}
          >
            {initialPrompt}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={onEdit}
              sx={{ textTransform: 'none' }}
            >
              Editar Prompt
            </Button>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default EditPromptAI;