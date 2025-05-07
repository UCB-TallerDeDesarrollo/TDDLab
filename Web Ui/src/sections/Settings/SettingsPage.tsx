import { useState, useEffect } from 'react';
import { Typography, Container, Box, CircularProgress } from '@mui/material';
import EditPromptAI from './components/EditPromptAI';
import { GetPrompts } from '../../modules/AIAssistant/application/GetPrompts';

const ConfigurationPage = () => {
  const [tddPrompt, setTddPrompt] = useState<string>("");
  const [refactoringPrompt, setRefactoringPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [editingTDD, setEditingTDD] = useState<boolean>(false);
  const [editingRefactoring, setEditingRefactoring] = useState<boolean>(false);

  useEffect(() => {
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

    loadPrompts();
  }, []);

  const handleEditTDD = () => {
    setEditingTDD(true);
  };

  const handleSaveTDD = (newPrompt: string) => {
    setTddPrompt(newPrompt);
    setEditingTDD(false);
  };

  const handleCancelTDD = () => {
    setEditingTDD(false);
  };

  const handleEditRefactoring = () => {
    setEditingRefactoring(true);
  };

  const handleSaveRefactoring = (newPrompt: string) => {
    setRefactoringPrompt(newPrompt);
    setEditingRefactoring(false);
  };

  const handleCancelRefactoring = () => {
    setEditingRefactoring(false);
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
        </>
      )}
    </Container>
  );
};

export default ConfigurationPage;