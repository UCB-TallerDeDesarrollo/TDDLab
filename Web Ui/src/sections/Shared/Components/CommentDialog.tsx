import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import InputAdornment from "@mui/material/InputAdornment";
import { useGitHubLinkValidation } from "../hooks/useGitHubLinkValidation";
import { Typography } from "@mui/material";

interface CommentDialogProps {
  open: boolean;
  link?: string;
  onSend: (comment: string, link: string) => void;
  onClose: () => void;
}

export const CommentDialog: React.FC<CommentDialogProps> = ({
  open,
  link,
  onClose,
  onSend,
}) => {
  const [comment, setComment] = useState("");
  const {
    repo,
    validLink,
    handleLinkChange,
    isLoading: isLinkLoading,
  } = useGitHubLinkValidation(link);
  const [edit, setEdit] = useState(false);
  const [originalLink] = useState(link);
  const [inputLink, setInputLink] = useState(link || "");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (link) {
      setIsLoading(false);
      setInputLink(link);
      handleLinkChange(link);
    } else {
      setInputLink("");
      setIsLoading(true);
    }
  }, [link, open]);

  useEffect(() => {
    if (repo || !link || !isLinkLoading) {
      setIsLoading(false);
    }
  }, [repo, link, isLinkLoading]);

  const handleCancel = () => {
    if (originalLink) {
      handleLinkChange(originalLink);
      setInputLink(originalLink);
    }
    setComment("");
    onClose();
  };

  const handleSend = () => {
    if (validLink && repo) {
      onSend(comment, repo);
      setEdit(false);
      onClose();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLink = e.target.value;
    setInputLink(newLink);
    handleLinkChange(newLink);
  };

  const dialogContentStyle = {
    fontSize: "15px",
    backgroundColor: "transparent",
  };

  const titleStyle = {
    fontSize: "1.1rem",
    fontWeight: "bold",
  };

  const renderEndAdornmentEdit = () => (
    <InputAdornment position="end">
      <IconButton aria-label="edit" edge="end" onClick={() => setEdit(!edit)}>
        {edit ? <CancelIcon /> : <EditIcon />}
      </IconButton>
    </InputAdornment>
  );

  const getInputColor = () => {
    if (repo === "") {
      return "primary";
    }
    if (!validLink) {
      return "error";
    }
    return "success";
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle style={titleStyle}>Repositorio de Github:</DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Typography variant="body2" color="textSecondary">
            Cargando...
          </Typography>
        ) : (
          <TextField
            margin="dense"
            label="Enlace del Repositorio"
            type="text"
            fullWidth
            value={edit ? inputLink : repo}
            onChange={handleInputChange}
            disabled={!edit}
            color={getInputColor()}
            InputProps={{
              endAdornment: renderEndAdornmentEdit(),
            }}
          />
        )}
        {!validLink && inputLink !== "" && !isLoading && (
          <Typography variant="body2" color="error">
            Advertencia: Link invÃ¡lido
          </Typography>
        )}
      </DialogContent>

      <DialogTitle style={titleStyle}>Comentario:</DialogTitle>
      <DialogContent>
        <DialogContentText style={dialogContentStyle}>
          Puedes dejar un comentario sobre tu tarea en este espacio (Opcional):
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="comment"
          label="Comentario"
          type="text"
          multiline
          rows={4.5}
          fullWidth
          value={comment}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setComment(event.target.value)
          }
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleCancel}
          color="primary"
          style={{ textTransform: "none", color: "#555" }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSend}
          color="primary"
          disabled={!validLink || repo === ""}
          style={{ textTransform: "none" }}
        >
          Enviar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
