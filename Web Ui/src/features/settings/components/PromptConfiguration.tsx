import React, { useState, useEffect } from 'react';
import {
  Box,
  Stack,
  Typography,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Button,
  CircularProgress,
  SelectChangeEvent,
  InputLabel
} from '@mui/material';

export interface PromptItem {
  id: string;
  name: string;
  content: string;
}

export interface PromptConfigurationProps {
  prompts: PromptItem[];
  selectedPrompt: string; // The ID of the selected prompt
  onChangePrompt: (promptId: string) => void;
  onSavePrompt: (promptId: string, newContent: string) => void;
  saving?: boolean;
}

export const PromptConfiguration: React.FC<PromptConfigurationProps> = ({
  prompts,
  selectedPrompt,
  onChangePrompt,
  onSavePrompt,
  saving = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  const currentPrompt = prompts.find((p) => p.id === selectedPrompt);

  useEffect(() => {
    if (currentPrompt) {
      setEditContent(currentPrompt.content);
      setIsEditing(false); // Reset edit mode when prompt changes
    }
  }, [currentPrompt, selectedPrompt]);

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    onChangePrompt(event.target.value);
  };

  const handleSave = () => {
    if (currentPrompt) {
      onSavePrompt(currentPrompt.id, editContent);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditContent(currentPrompt?.content || '');
  };

  return (
    <Stack spacing={3} sx={{ width: '100%' }}>
      <Box sx={{ width: '100%', mb: 2 }}>
        <FormControl fullWidth variant="outlined" sx={{ maxWidth: 400 }}>
          <InputLabel id="prompt-select-label">Selecciona el tipo de prompt</InputLabel>
          <Select
            labelId="prompt-select-label"
            id="prompt-select"
            value={selectedPrompt}
            onChange={handleSelectChange}
            disabled={isEditing || saving}
            label="Selecciona el tipo de prompt"
          >
            {prompts.map((prompt) => (
              <MenuItem key={prompt.id} value={prompt.id}>
                {prompt.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ border: '1.5px solid #898989', borderRadius: 2, p: 2 }}>
        <Box
          sx={{
            backgroundColor: '#E5E5E5',
            borderRadius: 1,
            p: 0,
            maxHeight: 350,
            overflowY: 'auto',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.12), inset 0 1px 2px rgba(0,0,0,0.24)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {isEditing ? (
            <TextField
              multiline
              fullWidth
              minRows={10}
              variant="outlined"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              disabled={saving}
              sx={{
                backgroundColor: 'background.paper',
                borderRadius: 1,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'transparent',
                  },
                  '&:hover fieldset': {
                    borderColor: 'transparent',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                    borderWidth: 1,
                  },
                },
              }}
            />
          ) : (
            <Box sx={{ p: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'pre-wrap',
                  color: 'text.primary',
                  fontFamily: 'monospace',
                }}
              >
                {currentPrompt?.content || 'Selecciona un prompt para visualizar su contenido.'}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        {isEditing ? (
          <>
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={saving || !editContent.trim() || editContent === currentPrompt?.content}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsEditing(true)}
            disabled={!currentPrompt || saving}
          >
            Editar Prompt
          </Button>
        )}
      </Box>
    </Stack>
  );
};

export default PromptConfiguration;
