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
}

const CommentDialog: React.FC<CommentDialogProps> = ({ open, onClose, onSend }) => {
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

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Enviar Comentario</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Por favor, ingrese su comentario a continuación:
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="comment"
          label="Comentario"
          type="text"
          fullWidth
          value={comment}
          onChange={handleCommentChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="secondary">
          Cancelar
        </Button>
        <Button onClick={handleSend} color="primary">
          Enviar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CommentDialog;
