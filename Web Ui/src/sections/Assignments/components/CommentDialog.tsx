import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { createSearchParams, useNavigate } from "react-router-dom";

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

  const handleCancel = () => {
    setComment("");
    onClose();
  };

  const handleSend = () => {
    onSend(comment, link ?? "");
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

  const navigate = useNavigate();

  const handleRedirect = () => {
    if (link) {
      const regex = /https:\/\/github\.com\/([^/]+)\/([^/]+)/;
      const match = regex.exec(link);

      if (match) {
        const [, user, repo] = match;
        console.log(user, repo);
        navigate({
          pathname: "/graph",
          search: createSearchParams({
            repoOwner: user,
            repoName: repo,
          }).toString(),
        });
      } else {
        alert(
          "Invalid GitHub URL. Please enter a valid GitHub repository URL."
        );
      }
    } else {
      alert("No GitHub URL found for this assignment.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle style={titleStyle}>Repositorio de Github:</DialogTitle>
      <DialogContent>
        {link && (
          <DialogContentText style={dialogContentStyle}>
            Enlace: {link}
          </DialogContentText>
        )}
        <Button
          // disabled={!isTaskInProgressOrDelivered}
          onClick={handleRedirect}
          color="primary">
            Ver grafica
        </Button>
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
        <Button onClick={handleCancel} color="primary">
          Cancelar
        </Button>
        <Button onClick={handleSend} color="primary">
          Enviar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
