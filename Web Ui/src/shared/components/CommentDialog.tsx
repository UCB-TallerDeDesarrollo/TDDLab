import React, { useState, useEffect } from "react";

interface CommentDialogProps {
  open: boolean;
  link?: string;
  onSend: (comment: string, updatedLink: string) => void; 
  onClose: () => void;
}

export const CommentDialog: React.FC<CommentDialogProps> = ({
  open,
  link = "",
  onSend,
  onClose,
}) => {
  const [comment, setComment] = useState("");
  const [currentLink, setCurrentLink] = useState(link);
  useEffect(() => {
    if (open) {
      setCurrentLink(link || "");
      setComment("");
    }
  }, [open, link]);

  const handleSend = () => {
    onSend(comment, currentLink);
  };

  if (!open) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <h3>Repositorio de Github:</h3>
        <div className="input-field-container">
          <label>Enlace del Repositorio</label>
          <input
            type="url"
            value={currentLink}
            onChange={(e) => setCurrentLink(e.target.value)}
            placeholder="https://github.com/usuario/repositorio"
            className="dialog-input"
          />
        </div>

        <h3>Comentario:</h3>
        <p>Puedes dejar un comentario sobre tu tarea en este espacio (Opcional):</p>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Comentario"
          className="dialog-textarea"
        />

        <div className="dialog-actions">
          <button type="button" onClick={onClose} className="btn-cancel">
            Cancelar
          </button>
          <button type="button" onClick={handleSend} className="btn-submit">
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};