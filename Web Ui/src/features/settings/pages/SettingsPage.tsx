import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, CircularProgress, Alert, Paper, Divider } from '@mui/material';
import { useSettings } from '../hooks/useSettings';
import { PromptConfiguration, PromptItem } from '../components/PromptConfiguration';
import { FeatureFlags } from '../components/FeatureFlags';

const SettingsPage: React.FC = () => {
  const {
    prompts,
    flags,
    loading,
    saving,
    error,
    loadSettings,
    savePrompt,
    toggleFeatureFlag
  } = useSettings();

  const [selectedPrompt, setSelectedPrompt] = useState<string>('tddPrompt');

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const promptItems: PromptItem[] = prompts
    ? [
        { id: 'tddPrompt', name: 'TDD Analysis Prompt', content: prompts.tddPrompt },
        { id: 'refactoringPrompt', name: 'Refactoring Prompt', content: prompts.refactoringPrompt },
        { id: 'evaluateTDDPrompt', name: 'Evaluation Prompt', content: prompts.evaluateTDDPrompt },
      ]
    : [];

  const handleSavePrompt = async (promptId: string, newContent: string) => {
    if (!prompts) return;
    const tdd = promptId === 'tddPrompt' ? newContent : prompts.tddPrompt;
    const refac = promptId === 'refactoringPrompt' ? newContent : prompts.refactoringPrompt;
    const evalPrompt = promptId === 'evaluateTDDPrompt' ? newContent : prompts.evaluateTDDPrompt;
    
    try {
      await savePrompt(tdd, refac, evalPrompt);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleFlag = async (id: number, newValue: boolean) => {
    try {
      // The hook toggles the value passed to it (`!currentValue`). 
      // Since newValue is what we want, we pass `!newValue` so the hook negates it back to `newValue`.
      await toggleFeatureFlag(id, !newValue);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading && !prompts) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          border: '1.5px solid #898989',
          borderRadius: '5px',
          p: 2,
          mb: 4,
          backgroundColor: '#fff', // Or something matching the design
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#002346',
            m: 0,
          }}
        >
          Configuración de Prompt
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {prompts && (
          <PromptConfiguration
            prompts={promptItems}
            selectedPrompt={selectedPrompt}
            onChangePrompt={setSelectedPrompt}
            onSavePrompt={handleSavePrompt}
            saving={saving}
          />
        )}

        {flags && flags.length > 0 && (
          <>
            <Divider />
            <FeatureFlags
              flags={flags as any} // Need to align types if necessary, but fields match based on earlier read.
              onToggleFlag={handleToggleFlag}
            />
          </>
        )}
      </Paper>
    </Container>
  );
};

export default SettingsPage;
