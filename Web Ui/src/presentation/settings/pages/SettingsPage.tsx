import React, { useEffect, useState } from 'react';
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
    savingFlag,
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
    } catch (error) {
      console.error("Error saving prompt settings:", error);
    }
  };

  const handleToggleFlag = async (id: number, newValue: boolean) => {
    try {
      await toggleFeatureFlag(id, newValue);
    } catch (error) {
      console.error("Error toggling feature flag:", error);
    }
  };

  let settingsStateContent = null;

  if (loading && prompts === null) {
    settingsStateContent = (
      <FeatureListSection>
        <ContentState
          variant="loading"
          title="Cargando..."
          description="Se están cargando los ajustes del sistema."
        />
      </FeatureListSection>
    );
  } else if (error) {
    settingsStateContent = (
      <FeatureListSection>
        <ContentState
          variant="error"
          title="Error al cargar..."
          description={error}
        />
      </FeatureListSection>
    );
  }

  return (
    <FeatureScreenLayout className="settings-page">
      <FeaturePageHeader title="Configuración de Prompt" />

      {settingsStateContent}

      {prompts && (
        <FeatureListSection>
          <PromptConfiguration
            prompts={promptItems}
            selectedPrompt={selectedPrompt}
            onChangePrompt={setSelectedPrompt}
            onSavePrompt={handleSavePrompt}
            saving={savingPrompt}
          />
        </FeatureListSection>
      )}

      {flags && flags.length > 0 && (
        <FeatureListSection title="Habilitación de Funcionalidades:">
          <FeatureFlags
            flags={flags}
            onToggleFlag={handleToggleFlag}
            saving={savingFlag}
          />
        </FeatureListSection>
      )}
    </FeatureScreenLayout>
  );
};

export default SettingsPage;
