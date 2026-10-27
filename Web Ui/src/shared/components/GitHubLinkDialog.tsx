import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Alert, Typography } from "@mui/material";
import { useGitHubLinkValidation } from "../hooks/useGitHubLinkValidation";
import { useState } from "react";

interface GithubLinkDialogProps {
  open: boolean;
  onClose: () => void;
  onSend: (link: string) => void | Promise<void>;
  initialLink?: string;
  mode?: "start" | "edit";
}

export const GitLinkDialog: React.FC<GithubLinkDialogProps> = ({
  open,
  onClose,
  onSend,
  initialLink = "",
  mode = "start",
}) => {
  const {
    repo: link,
    validLink,
    errorMessage,
    handleLinkChange,
  } = useGitHubLinkValidation(initialLink);

  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const handleSend = async () => {
    if (sending || !validLink) return;

    setSending(true);
    setSendError("");
    try {
      await Promise.resolve(onSend(link));
    } catch (error: any) {
      const backendMessage = error?.response?.data?.error;

      setSendError(
        backendMessage ||
          (mode === "edit"
            ? "No se pudo actualizar el enlace del repositorio. Intenta nuevamente."
            : "No se pudo guardar el inicio. Intenta nuevamente.")
      );
    } finally {
      setSending(false);
    }
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleLinkChange(e.target.value);
  };

  const dialogTitleStyle = {
    fontSize: "1rem",
  };

  const textFieldStyle = {
    fontSize: "12px",
  };

  const contentStyle = {
    fontSize: ".75rem",
    padding: "20px",
  };

  const getInputColor = () => {
    if (link === "") {
      return "primary";
    } else if (!validLink) {
      return "error";
    } else {
      return "success";
    }
  };

  return (
    <Dialog fullWidth={true} open={open} onClose={sending ? undefined : onClose}>
      <DialogTitle style={dialogTitleStyle}>
        {mode === "edit" ? "Editar enlace del repositorio" : "Link de Github"}
      </DialogTitle>
      <DialogContent style={contentStyle}>
        <TextField
          label="Enlace de Github"
          variant="outlined"
          color={getInputColor()}
          value={link}
          disabled={sending}
          onChange={handleInputChange}
          fullWidth
          focused
          style={textFieldStyle}
        />
        {!validLink && link !== "" && (
          <Typography variant="body2" color="error">
            {errorMessage}
          </Typography>
        )}
        {sendError && <Alert severity="error">{sendError}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          disabled={sending}
          color="primary"
          style={{ textTransform: "none" }}
        >
          Cerrar
        </Button>
        <Button
          onClick={handleSend}
          color="primary"
          disabled={sending || !validLink || link === ""}
          style={{ textTransform: "none" }}
        >
          {mode === "edit" ? "Guardar" : "Enviar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
