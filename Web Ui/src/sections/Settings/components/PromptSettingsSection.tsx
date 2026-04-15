import { Alert, Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Snackbar, Typography, CircularProgress } from "@mui/material";
import EditPromptAI from "./EditPromptAI";

const PROMPT_OPTIONS = [
  { label: "Prompt Analizar TDD", value: "tddPrompt" },
  { label: "Prompt Analizar Refactoring", value: "refactoringPrompt" },
  { label: "Prompt Evaluar TDD", value: "evaluateTDDPrompt" },
];

type Prompts = { tddPrompt: string; refactoringPrompt: string; evaluateTDDPrompt: string };

interface PromptSettingsSectionProps {
  loading: boolean;
  error: string | null;
  prompts: Prompts;
  selectedPrompt: string;
  isEditing: boolean;
  notification: { open: boolean; message: string; severity: "success" | "error" | "info" | "warning" };
  onPromptChange: (event: SelectChangeEvent) => void;
  onEdit: () => void;
  onSave: (value: string) => void;
  onCancel: () => void;
  onCloseNotification: () => void;
}

const PromptSettingsSection = ({
  loading,
  error,
  prompts,
  selectedPrompt,
  isEditing,
  notification,
  onPromptChange,
  onEdit,
  onSave,
  onCancel,
  onCloseNotification,
}: PromptSettingsSectionProps) => {
  return (
    <>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Configuración de Prompts
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ p: 2, bgcolor: "#ffebee", borderRadius: 1, mb: 4 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : (
        <>
          <FormControl sx={{ mb: 2, width: "50%" }}>
            <InputLabel id="prompt-select-label">Selecciona el tipo de Prompt</InputLabel>
            <Select
              labelId="prompt-select-label"
              value={selectedPrompt}
              label="Selecciona el tipo de Prompt"
              onChange={onPromptChange}
            >
              {PROMPT_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <EditPromptAI
            initialPrompt={prompts[selectedPrompt as keyof Prompts] ?? ""}
            isEditing={isEditing}
            onEdit={onEdit}
            onSave={onSave}
            onCancel={onCancel}
          />

          <Snackbar
            open={notification.open}
            autoHideDuration={6000}
            onClose={onCloseNotification}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert onClose={onCloseNotification} severity={notification.severity} sx={{ width: "100%" }}>
              {notification.message}
            </Alert>
          </Snackbar>


        </>
      )}
    </>
  );
};

export default PromptSettingsSection;
