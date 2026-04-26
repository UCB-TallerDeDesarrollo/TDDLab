import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Typography } from "@mui/material";
import { useGitHubLinkValidation } from "./GitValidationHook";
import { useState } from "react";

interface GithubLinkDialogProps {
  open: boolean;
  onClose: () => void;
  onSend: (link: string) => void;
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
    // ya estoy enviando o el link no es válido → salgo
    if (sending || !validLink) return;

    setSending(true);
    try {
      await onSend(link);
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
    <Dialog fullWidth={true} open={open} onClose={onClose}>
      <DialogTitle style={dialogTitleStyle}>Link de Github</DialogTitle>
      <DialogContent style={contentStyle}>
        <TextField
          label="Enlace de Github"
          variant="outlined"
          color={getInputColor()}
          value={link}
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
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
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
          Enviar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
