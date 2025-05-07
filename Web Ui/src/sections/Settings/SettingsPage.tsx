import { useState } from 'react';
import { Typography, Container, Box } from '@mui/material';
import EditPromptAI from './components/EditPromptAI';

const ConfigurationPage = () => {
  const [tddPrompt, setTddPrompt] = useState<string>(
    "Este es el prompt actual para evaluación de TDD. Aquí iría el texto que se usa actualmente para la evaluación de TDD en la aplicación."
  );
  const [refactoringPrompt, setRefactoringPrompt] = useState<string>(
    "Este es el prompt actual para evaluación de Refactoring. Aquí iría el texto que se usa actualmente para la evaluación de Refactoring en la aplicación."
  );

  const [editingTDD, setEditingTDD] = useState<boolean>(false);
  const [editingRefactoring, setEditingRefactoring] = useState<boolean>(false);

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

  // Se eliminó la función handleClearAll y el botón correspondiente

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

      {/* TDD Prompt Section */}
      <EditPromptAI
        title="Prompt de Evaluación TDD"
        initialPrompt={tddPrompt}
        isEditing={editingTDD}
        onEdit={handleEditTDD}
        onSave={handleSaveTDD}
        onCancel={handleCancelTDD}
      />

      {/* Refactoring Prompt Section */}
      <EditPromptAI
        title="Prompt de Evaluación Refactoring"
        initialPrompt={refactoringPrompt}
        isEditing={editingRefactoring}
        onEdit={handleEditRefactoring}
        onSave={handleSaveRefactoring}
        onCancel={handleCancelRefactoring}
      />
    </Container>
  );
};

export default ConfigurationPage;