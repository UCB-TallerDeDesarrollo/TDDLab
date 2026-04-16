import React, { useEffect, useState } from 'react';
import { Box, Alert } from '@mui/material';
import { useSettings } from '../hooks/useSettings';
import { PromptConfiguration, PromptItem } from '../components/PromptConfiguration';
import { FeatureFlags } from '../components/FeatureFlags';
import FeatureScreenLayout from '../../../shared/components/FeatureScreenLayout';
import FeaturePageHeader from '../../../shared/components/FeaturePageHeader';
import FeatureListSection from '../../../shared/components/FeatureListSection';
import ContentState from '../../../shared/components/ContentState';

const SettingsPage: React.FC = () => {
  const {
    prompts,
    flags,
    loading,
    savingPrompt,
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
        { id: 'tddPrompt', name: 'Analizar TDD Prompt', content: prompts.tddPrompt },
        { id: 'refactoringPrompt', name: 'Analizar Refactoring Prompt', content: prompts.refactoringPrompt },
        { id: 'evaluateTDDPrompt', name: 'Evaluar TDD Prompt', content: prompts.evaluateTDDPrompt },
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
      // Error handled by useSettings hook (UI feedback)
    }
  };

  const handleToggleFlag = async (id: number, newValue: boolean) => {
    try {
      await toggleFeatureFlag(id, newValue);
    } catch (e) {
      // Error handled by useSettings hook (UI feedback)
    }
  };

  if (loading && !prompts) {
    return (
      <FeatureScreenLayout>
        <ContentState
          variant="loading"
          title="Cargando configuración"
          description="Se están cargando los ajustes del sistema."
        />
      </FeatureScreenLayout>
    );
  }

  return (
    <FeatureScreenLayout className="Ajustes">
      <FeaturePageHeader title="Configuración de Prompt" />

      {error && (
        <Alert severity="error" sx={{ mb: 3, mt: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
        {prompts && (
          <PromptConfiguration
            prompts={promptItems}
            selectedPrompt={selectedPrompt}
            onChangePrompt={setSelectedPrompt}
            onSavePrompt={handleSavePrompt}
            saving={savingPrompt}
          />
        )}
      </Box>

      <Box sx={{ pl: { xs: 2, md: 12.75 } }}>
        <FeatureListSection title="Habilitación de Funcionalidades:">
          {flags && flags.length > 0 && (
            <FeatureFlags
              flags={flags}
              onToggleFlag={handleToggleFlag}
            />
          )}
        </FeatureListSection>
      </Box>
    </FeatureScreenLayout>
  );
};

export default SettingsPage;
