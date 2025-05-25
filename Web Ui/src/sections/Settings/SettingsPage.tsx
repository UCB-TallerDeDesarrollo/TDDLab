import { useState, useEffect } from 'react';
import { Typography, Container, Box, CircularProgress, Snackbar, Alert } from '@mui/material';
import EditPromptAI from './components/EditPromptAI';
import { GetPrompts } from '../../modules/AIAssistant/application/GetPrompts';
import { UpdatePrompts } from '../../modules/AIAssistant/application/UpdatePrompts';
import { GetFeatureFlags } from "../../modules/FeatureFlags/application/GetFeatureFlags";
import { FeatureFlag } from "../../modules/FeatureFlags/domain/FeatureFlag";
import { UpdateFeatureFlag } from "../../modules/FeatureFlags/application/UpdateFeatureFlag";
const ConfigurationPage = () => {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [tddPrompt, setTddPrompt] = useState<string>("");
  const [refactoringPrompt, setRefactoringPrompt] = useState<string>("");
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

  const [editingTDD, setEditingTDD] = useState<boolean>(false);
  const [editingRefactoring, setEditingRefactoring] = useState<boolean>(false);
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
      const prompts = await getPromptsUseCase.execute();
      
      setTddPrompt(prompts.tddPrompt);
      setRefactoringPrompt(prompts.refactoringPrompt);
      setError(null);
    } catch (error) {
      console.error("Error al cargar los prompts:", error);
      setError("No se pudieron cargar los prompts. Por favor, intenta de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditTDD = () => {
    setEditingTDD(true);
  };

  const handleSaveTDD = async (newPrompt: string) => {
    try {
      setSaving(true);
      const updatePromptsUseCase = new UpdatePrompts();
      await updatePromptsUseCase.execute(newPrompt, refactoringPrompt);
      
      setTddPrompt(newPrompt);
      setNotification({
        open: true,
        message: "Prompt de TDD actualizado correctamente",
        severity: "success"
      });
    } catch (error) {
      console.error("Error al actualizar el prompt de TDD:", error);
      setNotification({
        open: true,
        message: "Error al actualizar el prompt de TDD",
        severity: "error"
      });
    } finally {
      setSaving(false);
      setEditingTDD(false);
    }
  };

  const handleCancelTDD = () => {
    setEditingTDD(false);
  };

  const handleEditRefactoring = () => {
    setEditingRefactoring(true);
  };

  const handleSaveRefactoring = async (newPrompt: string) => {
    try {
      setSaving(true);
      const updatePromptsUseCase = new UpdatePrompts();
      await updatePromptsUseCase.execute(tddPrompt, newPrompt);
      
      setRefactoringPrompt(newPrompt);
      setNotification({
        open: true,
        message: "Prompt de Refactoring actualizado correctamente",
        severity: "success"
      });
    } catch (error) {
      console.error("Error al actualizar el prompt de Refactoring:", error);
      setNotification({
        open: true,
        message: "Error al actualizar el prompt de Refactoring",
        severity: "error"
      });
    } finally {
      setSaving(false);
      setEditingRefactoring(false);
    }
  };

  const handleCancelRefactoring = () => {
    setEditingRefactoring(false);
  };

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };
  const handleCheckboxChange = async (id: number, currentValue: boolean) => {
    const confirmChange = window.confirm(
      `¿Estás seguro de que quieres ${!currentValue ? "habilitar" : "deshabilitar"} esta funcionalidad?`
    );
    if (!confirmChange) return;

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
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
        >
          Configuración de Prompts
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ p: 2, bgcolor: '#ffebee', borderRadius: 1, mb: 4 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : (
        <>
          <EditPromptAI
            title="Prompt de Evaluación TDD"
            initialPrompt={tddPrompt}
            isEditing={editingTDD}
            onEdit={handleEditTDD}
            onSave={handleSaveTDD}
            onCancel={handleCancelTDD}
          />

          <EditPromptAI
            title="Prompt de Evaluación Refactoring"
            initialPrompt={refactoringPrompt}
            isEditing={editingRefactoring}
            onEdit={handleEditRefactoring}
            onSave={handleSaveRefactoring}
            onCancel={handleCancelRefactoring}
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
            <Box
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1300,
              }}
            >
              <CircularProgress color="primary" />
            </Box>
          )}
        </>
      )}
      <div style={{ padding: "1rem" }}>
      <h2>Habilitación de Funcionalidades</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {flags.map((flag) => (
        <div key={flag.id} style={{ marginBottom: "10px" }}>
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
    </div>
    </Container>
    
  );
};

export default ConfigurationPage;