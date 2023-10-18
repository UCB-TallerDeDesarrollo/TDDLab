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
  const [isVerGraficaEnabled, setIsVerGraficaEnabled] = useState(false);
  const [flag, setFlag] = React.useState(true);

  const handleSend = () => {
    onSend(link);
    setIsVerGraficaEnabled(true);
    setFlag(!flag);
  };

  const handleRedirect = () => {};

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
          color={flag ? "primary" : "success"}
          value={link}
          onChange={(e) => setLink(e.target.value)}
          fullWidth
          focused
          style={textFieldStyle}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cerrar
        </Button>
        <Button onClick={handleSend} color="primary">
          Enviar
        </Button>
        <Button color="primary" disabled={!isVerGraficaEnabled}>
          Ver gráfica
        </Button>
      </DialogActions>
    </Dialog>
  );
};
