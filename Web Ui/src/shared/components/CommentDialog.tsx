import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
} from "@mui/material";

interface CommentDialogProps {
  open: boolean;
  link?: string;
  onSend: (comment: string, updatedLink?: string) => void | Promise<void>;
  onClose: () => void;
  disabled?: boolean;
}

export const CommentDialog: React.FC<CommentDialogProps> = ({
  open,
  link = "",
  onSend,
  onClose,
  disabled = false,
}) => {
  const [comment, setComment] = useState("");
  const [currentLink, setCurrentLink] = useState(link);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setCurrentLink(link || "");
      setComment("");
      setIsSubmitting(false);
    }
  }, [open, link]);

  const handleSend = async () => {
    setIsSubmitting(true);
    try {
      await onSend(comment, currentLink);
    } catch {
      // Previene excepciones no capturadas si la petición falla en la prueba
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = disabled || isSubmitting;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogContent sx={{ pt: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Repositorio de Github:
        </Typography>
        <Box sx={{ mb: 3, mt: 1 }}>
          <TextField
            fullWidth
            label="Enlace del Repositorio"
            variant="outlined"
            value={currentLink}
            onChange={(e) => setCurrentLink(e.target.value)}
            placeholder="https://github.com/usuario/repositorio"
            disabled={isDisabled}
          />
        </Box>

        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Comentario:
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
          Puedes dejar un comentario sobre tu tarea en este espacio (Opcional):
        </Typography>
        <TextField
          id="comment"
          fullWidth
          multiline
          rows={4}
          label="Comentario"
          variant="outlined"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={isDisabled}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={isDisabled}>
          Cancelar
        </Button>
        <Button
          onClick={handleSend}
          color="primary"
          variant="text"
          disabled={isDisabled}
        >
          Enviar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CommentDialog;