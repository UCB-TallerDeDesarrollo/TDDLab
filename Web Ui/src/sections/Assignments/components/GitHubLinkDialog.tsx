import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

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
  const [link, setLink] = useState("");
  const [validLink, setValidLink] = React.useState(true);

  const handleSend = () => {
    if (validLink) {
      onSend(link);
      setValidLink(false);
    }
  };

  const validateGitHubLink = (text: string): boolean => {
    const regex = /https:\/\/github\.com\/([^/]+)\/([^/]+)/;
    return regex.test(text);
  };

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLink = e.target.value;
    setLink(newLink);
    setValidLink((prevValidLink) => {
      return validateGitHubLink(newLink) ? true : prevValidLink;
    });
  };

  const warningStyle = {
    color: "orange",
    position: "absolute" as const,
    bottom: "-20px",
  };

  const dialogTitleStyle = {
    fontSize: "1rem",
  };

  const textFieldStyle = {
    fontSize: "12px",
  };
  const contentStyle = {
    fontSize: "12px",
    padding: "20px",
  };

  return (
    <Dialog fullWidth={true} open={open} onClose={onClose}>
      <DialogTitle style={dialogTitleStyle}>Link de Github</DialogTitle>
      <DialogContent style={contentStyle}>
        <TextField
          label="Enlace de Github"
          variant="outlined"
          color={
            validLink ? "primary" : validLink === false ? "error" : "success"
          }
          value={link}
          onChange={handleLinkChange}
          fullWidth
          focused
          style={textFieldStyle}
        />
        {!validLink && <div style={warningStyle}>Warning: Invalid link</div>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cerrar
        </Button>
        <Button onClick={handleSend} color="primary" disabled={!validLink}>
          Enviar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
