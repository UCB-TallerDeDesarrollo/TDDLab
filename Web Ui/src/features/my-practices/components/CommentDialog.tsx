import React, { useEffect, useState } from "react";
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
import { Typography } from "@mui/material";
import { useGitHubLinkValidation } from "../../../sections/Shared/hooks/useGitHubLinkValidation";

interface CommentDialogProps {
  open: boolean;
  link?: string;
  onSend: (comment: string) => Promise<void> | void;
  onClose: () => void;
}

export const CommentDialog: React.FC<CommentDialogProps> = ({
  open,
  link,
  onClose,
  onSend,
}) => {
  const [comment, setComment] = useState("");
  const { repo, validLink, handleLinkChange, isLoading: isLinkLoading } =
    useGitHubLinkValidation(link);
  const [edit, setEdit] = useState(false);
  const [originalLink] = useState(link);
  const [inputLink, setInputLink] = useState(link || "");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (link) {
      setIsLoading(false);
      setInputLink(link);
      handleLinkChange({ target: { value: link } } as React.ChangeEvent<HTMLInputElement>);
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
      handleLinkChange({
        target: { value: originalLink },
      } as React.ChangeEvent<HTMLInputElement>);
      setInputLink(originalLink);
    }
    setComment("");
    onClose();
  };

  const handleSend = async () => {
    if (validLink && repo) {
      await onSend(comment);
      setEdit(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Repositorio de Github:</DialogTitle>
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const newLink = e.target.value;
              setInputLink(newLink);
              handleLinkChange({
                target: { value: newLink },
              } as React.ChangeEvent<HTMLInputElement>);
            }}
            disabled={!edit}
            color={repo === "" ? "primary" : validLink ? "success" : "error"}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="edit"
                    edge="end"
                    onClick={() => setEdit(!edit)}
                  >
                    {edit ? <CancelIcon /> : <EditIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}
      </DialogContent>

      <DialogTitle>Comentario:</DialogTitle>
      <DialogContent>
        <DialogContentText>
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
        <Button onClick={handleCancel} color="primary">
          Cancelar
        </Button>
        <Button
          onClick={handleSend}
          color="primary"
          disabled={!validLink || repo === ""}
        >
          Enviar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
