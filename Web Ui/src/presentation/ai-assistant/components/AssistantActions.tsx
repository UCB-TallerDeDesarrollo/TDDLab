import AutorenewIcon from "@mui/icons-material/Autorenew";
import CodeIcon from "@mui/icons-material/Code";
import GradeIcon from "@mui/icons-material/Grade";
import { Box, Button, CircularProgress } from "@mui/material";
import { AssistantAction } from "../types/aiAssistant.types";

interface AssistantActionsProps {
  loadingAction: AssistantAction | null;
  onAction: (action: AssistantAction) => void;
}

export default function AssistantActions({
  loadingAction,
  onAction,
}: Readonly<AssistantActionsProps>) {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Button
        variant="contained"
        color="primary"
        onClick={() => onAction("analiza")}
        disabled={loadingAction !== null}
        fullWidth
        startIcon={<CodeIcon />}
      >
        {loadingAction === "analiza" ? <CircularProgress size={20} /> : " Analizar TDD"}
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={() => onAction("refactoriza")}
        disabled={loadingAction !== null}
        fullWidth
        startIcon={<AutorenewIcon />}
      >
        {loadingAction === "refactoriza" ? <CircularProgress size={20} /> : " Analizar Refactoring"}
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={() => onAction("califica")}
        disabled={loadingAction !== null}
        fullWidth
        startIcon={<GradeIcon />}
      >
        {loadingAction === "califica" ? <CircularProgress size={20} /> : "Evaluar TDD"}
      </Button>
    </Box>
  );
}
