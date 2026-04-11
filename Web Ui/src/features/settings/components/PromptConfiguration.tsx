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
  SelectChangeEvent
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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          Seleccionar Prompt
        </Typography>
        <FormControl size="small" sx={{ maxWidth: 400 }}>
          <Select
            value={selectedPrompt}
            onChange={handleSelectChange}
            disabled={isEditing || saving}
            displayEmpty
          >
            {prompts.map((prompt) => (
              <MenuItem key={prompt.id} value={prompt.id}>
                {prompt.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box
        sx={{
          backgroundColor: '#E5E5E5',
          borderRadius: 2,
          p: 2,
          minHeight: 250,
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid',
          borderColor: 'divider',
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
          <Typography
            variant="body2"
            sx={{
              whiteSpace: 'pre-wrap',
              color: 'text.primary',
              fontFamily: 'monospace',
              flexGrow: 1,
              overflowY: 'auto',
            }}
          >
            {currentPrompt?.content || 'Selecciona un prompt para visualizar su contenido.'}
          </Typography>
        )}
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
