import { useState, useEffect } from 'react';
import { Container } from '@mui/material';
import PromptSettingsSection from './components/PromptSettingsSection';
import FeatureFlagsSection from './components/FeatureFlagsSection';
import { GetPrompts } from '../../modules/AIAssistant/application/GetPrompts';
import { UpdatePrompts } from '../../modules/AIAssistant/application/UpdatePrompts';
import { GetFeatureFlags } from "../../modules/FeatureFlags/application/GetFeatureFlags";
import { UpdateFeatureFlag } from "../../modules/FeatureFlags/application/UpdateFeatureFlag";
import { FeatureFlag } from "../../modules/FeatureFlags/domain/FeatureFlag";

const ConfigurationPage = () => {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  const [prompts, setPrompts] = useState<{ tddPrompt: string; refactoringPrompt: string; evaluateTDDPrompt: string }>({ tddPrompt: "", refactoringPrompt: "", evaluateTDDPrompt: "" });
  const [selectedPrompt, setSelectedPrompt] = useState<string>("tddPrompt");
  const [isEditing, setEditing] = useState(false);
  const getFlagsUseCase = new GetFeatureFlags();
  const updateFlagUseCase = new UpdateFeatureFlag();
  useEffect(() => {
    const fetchFlags = async () => {
      try {
        const data = await getFlagsUseCase.execute();
        setFlags(data);
      } catch (err) {
        console.error("Error al cargar los flags", err);
        setError("Error al cargar los flags");
      }
    };
    fetchFlags();
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    try {
      setLoading(true);
      const getPromptsUseCase = new GetPrompts();
      const promptsData = await getPromptsUseCase.execute();
      
      setPrompts({
        tddPrompt: promptsData.tddPrompt,
        refactoringPrompt: promptsData.refactoringPrompt,
        evaluateTDDPrompt: promptsData.evaluateTDDPrompt
      });
      setError(null);
    } catch (error) {
      console.error("Error al cargar los prompts:", error);
      setError("No se pudieron cargar los prompts. Por favor, intenta de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handlePromptChange = (event: any) => {
    setSelectedPrompt(event.target.value);
    setEditing(false);
  };

  const handleEditPrompt = () => {
    setEditing(true);
  };

  const handleSavePrompt = async (newPrompt: string) => {
    try {
      setSaving(true);
      const updatePromptsUseCase = new UpdatePrompts();
      let updatePrompts = { ...prompts };
      updatePrompts[selectedPrompt as keyof typeof prompts] = newPrompt;
      await updatePromptsUseCase.execute(
        updatePrompts.tddPrompt,
        updatePrompts.refactoringPrompt,
        updatePrompts.evaluateTDDPrompt
      );
      setPrompts(updatePrompts);
      setNotification({
        open: true,
        message: "Prompt actualizado correctamente",
        severity: "success"
      });
      setEditing(false);
    } catch (error) {
      setNotification({
        open: true,
        message: "Error al actualizar el prompt",
        severity: "error"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    loadPrompts();
  };
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };
  const handleCheckboxChange = async (id: number, currentValue: boolean) => {
    try {
      const updatedFlag = await updateFlagUseCase.execute(id, !currentValue);
      setFlags((prevFlags) =>
        prevFlags.map((flag) =>
          flag.id === id ? updatedFlag : flag
        )
      );
    } catch (err) {
      console.error("Error al actualizar el flag", err);
      setError("Error al actualizar el flag");
    }
  };
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PromptSettingsSection
        loading={loading}
        saving={saving}
        error={error}
        prompts={prompts}
        selectedPrompt={selectedPrompt}
        isEditing={isEditing}
        notification={notification}
        onPromptChange={handlePromptChange}
        onEdit={handleEditPrompt}
        onSave={handleSavePrompt}
        onCancel={handleCancelEdit}
        onCloseNotification={handleCloseNotification}
      />
      <FeatureFlagsSection flags={flags} onToggle={handleCheckboxChange} />
     
    </Container>
    
  );
};

export default ConfigurationPage;