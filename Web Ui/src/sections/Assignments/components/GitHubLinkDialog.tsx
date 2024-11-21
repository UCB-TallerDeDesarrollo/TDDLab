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
    handleLinkChange,
  } = useGitHubLinkValidation("");
  
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>("");


  const handleSend = () => {
    if (validLink) {
      onSend(link);
    }
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleLinkChange(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile?.name === "tdd_log.json") {
      setFile(uploadedFile);
      setFileError("");
    } else {
      setFile(null);
      setFileError("Solo se acepta el archivo tdd_log.json");
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
          color={ getInputColor() }
          value={link}
          onChange={handleInputChange}
          fullWidth
          focused
          style={textFieldStyle}
        />
        {!validLink && link !== "" && (
          <Typography variant="body2" color="error">
            Advertencia, link invalido.
          </Typography>
        )}
        <div style={{ marginTop: "20px" }}>
          <Typography variant="body2" style={{ marginBottom: "10px" }}>
            Subir archivo (solo tdd_log.json):
          </Typography>
          <input
            type="file"
            accept=".json"
            onChange={handleFileChange}
            style={{ display: "block" }}
          />
          {fileError && (
            <Typography variant="body2" color="error">
              {fileError}
            </Typography>
          )}
        </div>
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
          disabled={!validLink || link == ""}
          style={{ textTransform: "none" }}
        >
          Enviar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
