import { useState, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem,
         Typography, Container, Box, CircularProgress, Snackbar, Alert } from '@mui/material';
import EditPromptAI from './components/EditPromptAI';
import { GetPrompts } from '../../modules/AIAssistant/application/GetPrompts';
import { UpdatePrompts } from '../../modules/AIAssistant/application/UpdatePrompts';
import { GetFeatureFlags } from "../../modules/FeatureFlags/application/GetFeatureFlags";
import { FeatureFlag } from "../../modules/FeatureFlags/domain/FeatureFlag";
import { UpdateFeatureFlag } from "../../modules/FeatureFlags/application/UpdateFeatureFlag";
import "../../App.css";

const PROMPT_OPTIONS = [
  { label: "Prompt Analizar TDD", value: "tddPrompt" },
  { label: "Prompt Analizar Refactoring", value: "refactoringPrompt" },
  { label: "Prompt Evaluar TDD", value: "evaluateTDDPrompt" },
];

const ConfigurationPage = () => {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'info' });
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

  const handleEditPrompt = () => setEditing(true);

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
      setNotification({ open: true, message: "Prompt actualizado correctamente", severity: "success" });
      setEditing(false);
    } catch (error) {
      setNotification({ open: true, message: "Error al actualizar el prompt", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    loadPrompts();
  };

  const handleCloseNotification = () => setNotification({ ...notification, open: false });

  const handleCheckboxChange = async (id: number, currentValue: boolean) => {
    const confirmChange = window.confirm(
      `¿Estás seguro de que quieres ${!currentValue ? "habilitar" : "deshabilitar"} esta funcionalidad?`
    );
    if (!confirmChange) return;
    try {
      const updatedFlag = await updateFlagUseCase.execute(id, !currentValue);
      setFlags((prevFlags) => prevFlags.map((flag) => flag.id === id ? updatedFlag : flag));
    } catch (err) {
      console.error("Error al actualizar el flag", err);
      setError("Error al actualizar el flag");
    }
  };

  return (
    <div className="centered-container">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <div className="settings-section-title">
            Configuración de Prompts
          </div>
        </Box>

        {loading ? (
          <div className="fullscreen-loading">
            <CircularProgress />
          </div>
        ) : error ? (
          <Box sx={{ p: 2, bgcolor: '#ffebee', borderRadius: 1, mb: 4 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (
          <>
            <div className="sorting-container">
              <FormControl 
                sx={{ mb: 2, width: '50%' }} 
                size="small" // 'small' ayuda a que el label de MUI se alinee mejor con el alto de 36px
              >
                <InputLabel id="prompt-select-label">Selecciona el tipo de Prompt</InputLabel>
                <Select
                  labelId="prompt-select-label"
                  value={selectedPrompt}
                  label="Selecciona el tipo de Prompt"
                  onChange={handlePromptChange}
                  className="select-compact"
                >
                  {PROMPT_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <EditPromptAI
              initialPrompt={prompts[selectedPrompt as keyof typeof prompts] ?? ""}
              isEditing={isEditing}
              onEdit={handleEditPrompt}
              onSave={handleSavePrompt}
              onCancel={handleCancelEdit}
            />

            <Snackbar
              open={notification.open}
              autoHideDuration={6000}
              onClose={handleCloseNotification}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
              <Alert
                onClose={handleCloseNotification}
                severity={notification.severity}
                sx={{ width: '100%' }}
              >
                {notification.message}
              </Alert>
            </Snackbar>

            {saving && (
              <div className="saving-overlay">
                <CircularProgress color="primary" />
              </div>
            )}
          </>
        )}

        <div className="settings-section-title--spaced">
          Habilitación de Funcionalidades
        </div>

        {error && <p className="settings-error-text">{error}</p>}

        {flags.map((flag) => (
          <div key={flag.id} className="settings-flag-item">
            <label>
              <input
                type="checkbox"
                checked={flag.is_enabled}
                onChange={() => handleCheckboxChange(flag.id, flag.is_enabled)}
              />
              {flag.feature_name}
            </label>
          </div>
        ))}
      </Container>
    </div>
  );
};

export default ConfigurationPage;