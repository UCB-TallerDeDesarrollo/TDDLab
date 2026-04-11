import { useState, useCallback } from "react";
import { settingsService } from "../services/settings.service";
import { AIPromptResponse } from "../../../modules/AIAssistant/domain/AIAssistantRepositoryInterface";
import { FeatureFlag } from "../../../modules/FeatureFlags/domain/FeatureFlag";

export const useSettings = () => {
  const [prompts, setPrompts] = useState<AIPromptResponse | null>(null);
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [promptsData, flagsData] = await Promise.all([
        settingsService.getPrompts(),
        settingsService.getFeatureFlags()
      ]);
      setPrompts(promptsData);
      setFlags(flagsData);
    } catch (err) {
      setError("Error al cargar la configuración");
    } finally {
      setLoading(false);
    }
  }, []);

  const savePrompt = useCallback(async (tddPrompt: string, refactoringPrompt: string, evaluateTDDPrompt: string) => {
    setSaving(true);
    setError(null);
    try {
      const updatedPrompts = await settingsService.updatePrompts(tddPrompt, refactoringPrompt, evaluateTDDPrompt);
      setPrompts(updatedPrompts);
      return updatedPrompts;
    } catch (err) {
      setError("Error al guardar los prompts");
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const toggleFeatureFlag = useCallback(async (id: number, currentValue: boolean) => {
    setSaving(true);
    setError(null);
    try {
      const updatedFlag = await settingsService.updateFeatureFlag(id, !currentValue);
      setFlags((prevFlags) => 
        prevFlags.map((flag) => (flag.id === id ? updatedFlag : flag))
      );
      return updatedFlag;
    } catch (err) {
      setError("Error al actualizar la flag");
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    prompts,
    flags,
    loading,
    saving,
    error,
    loadSettings,
    savePrompt,
    toggleFeatureFlag
  };
};
