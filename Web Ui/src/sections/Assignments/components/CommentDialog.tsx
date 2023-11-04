import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

interface CommentDialogProps {
  open: boolean;
  onClose: () => void;
  onSend: (comment: string) => void;
  link?: string;
}

const CommentDialog: React.FC<CommentDialogProps> = ({
  open,
  onClose,
  onSend,
  link,
}) => {
  const [comment, setComment] = useState("");

  const handleCancel = () => {
    setComment("");
    onClose();
  };

  const handleSend = () => {
    onSend(comment);
    setComment("");
  };

  const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setComment(event.target.value);
  };

  const dialogContentStyle = {
    fontFamily: "Roboto",
    fontSize: "15px",
  };
  const titleStyle = {
    fontSize: "1.1rem",
    fontWeight: "bold",
    fontFamily: "Roboto",
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
    >
      <DialogTitle style={titleStyle}>Repositorio de Github:</DialogTitle>
      <DialogContent>
        {link && (
          <DialogContentText style={dialogContentStyle}>
            Enlace: {link}
          </DialogContentText>
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
          onChange={handleCommentChange}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleCancel}
          color="primary"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSend}
          color="primary"
        >
          Enviar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CommentDialog;
