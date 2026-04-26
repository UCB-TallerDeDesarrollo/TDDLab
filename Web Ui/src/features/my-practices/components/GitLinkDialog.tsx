import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Typography } from "@mui/material";
import { useGitHubLinkValidation } from "../hooks/useGitHubLinkValidation";

interface GithubLinkDialogProps {
  open: boolean;
  onClose: () => void;
  onSend: (link: string) => Promise<void> | void;
}

export const GitLinkDialog: React.FC<GithubLinkDialogProps> = ({
  open,
  onClose,
  onSend,
}) => {
  const {
    repo: link,
    validLink,
    errorMessage,
    handleLinkChange,
  } = useGitHubLinkValidation("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (sending || !validLink) return;
    setSending(true);
    try {
      await onSend(link);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogContent>
        <TextField
          label="Enlace de Github"
          variant="outlined"
          color={link === "" ? "primary" : validLink ? "success" : "error"}
          value={link}
          onChange={handleLinkChange}
          fullWidth
          focused
        />
        {!validLink && link !== "" && (
          <Typography variant="body2" color="error">
            {errorMessage}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Cerrar
        </Button>
        <Button
          onClick={handleSend}
          variant="contained"
          disabled={sending || !validLink || link === ""}
        >
          Enviar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
