import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Typography } from "@mui/material";
import { useGitHubLinkValidation } from "./GitValidationHook";

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
    handleLinkChange,
  } = useGitHubLinkValidation("");

  const handleSend = () => {
    if (validLink) {
      onSend(link);
    }
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

  return (
    <Dialog fullWidth={true} open={open} onClose={onClose}>
      <DialogTitle style={dialogTitleStyle}>Link de Github</DialogTitle>
      <DialogContent style={contentStyle}>
        <TextField
          label="Enlace de Github"
          variant="outlined"
          color={
            link === "" ? "primary" : validLink === false ? "error" : "success"
          }
          value={link}
          onChange={handleLinkChange}
          fullWidth
          focused
          style={textFieldStyle}
        />
        {!validLink && link !== "" && (
          <Typography variant="body2" color="error">
            Warning: Invalid link
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cerrar
        </Button>
        <Button
          onClick={handleSend}
          color="primary"
          disabled={!validLink || link == ""}
        >
          Enviar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
