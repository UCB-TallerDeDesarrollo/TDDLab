import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Typography } from "@mui/material";
import { useGitHubLinkValidation } from "../hooks/useGitHubLinkValidation";
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

  const textFieldStyle = {
    fontSize: "16px",
    "& .MuiOutlinedInput-root": {
      borderRadius: "0px",
      "& fieldset": {
        borderColor: "#1CC5DC",
        borderWidth: "4px",
      },
      "&:hover fieldset": {
        borderColor: "#00B5CC",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#00B5CC",
      },
    },
  };

  const contentStyle = {
    fontSize: "1rem",
    padding: "32px 24px",
  };

  const buttonCloseStyle = {
    textTransform: "none",
    backgroundColor: "#707070",
    color: "white",
    padding: "8px 24px",
    fontSize: "14px",
    fontWeight: 600,
    "&:hover": {
      backgroundColor: "#595959",
    },
  };

  const buttonSendStyle = {
    textTransform: "none",
    backgroundColor: "#1976d2",
    color: "white",
    padding: "8px 32px",
    fontSize: "14px",
    fontWeight: 600,
    "&:hover": {
      backgroundColor: "#1565c0",
    },
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
    <Dialog
      fullWidth={true}
      maxWidth="sm"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { borderRadius: "0px" }
      }}
    >
      <DialogContent style={contentStyle}>
        <TextField
          label="Enlace de Github"
          variant="outlined"
          color={getInputColor()}
          value={link}
          onChange={handleInputChange}
          fullWidth
          focused
          sx={textFieldStyle}
          inputProps={{ style: { padding: "18px 12px", fontSize: "16px" } }}
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
          variant="contained"
          sx={buttonCloseStyle}
        >
          Cerrar
        </Button>
        <Button
          onClick={handleSend}
          variant="contained"
          disabled={sending || !validLink || link === ""}
          sx={buttonSendStyle}
        >
          Enviar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
