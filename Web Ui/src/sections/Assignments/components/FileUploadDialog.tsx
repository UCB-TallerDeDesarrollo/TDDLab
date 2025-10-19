import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
interface FileUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onUpload: (file: any) => void; // Cambiado el tipo de File a any y el retorno a void
}


const FileUploadDialog: React.FC<FileUploadDialogProps> = ({
  open,
  onClose,
  onUpload,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    } else {
      setError("No file selected");
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      try {
        await onUpload(selectedFile);
        setShowSuccessDialog(true); 
        onClose();
      } catch (uploadError) {
        console.error("Error al subir el archivo:", uploadError);
        setError("Error al subir el archivo. Por favor, inténtalo de nuevo.");
      }
    } else {
      setError("Por favor selecciona un archivo antes de subirlo.");
    }
  };

  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Subir Sesión TDD</DialogTitle>
        <DialogContent>
          <Typography variant="body2" style={{ marginBottom: "10px" }}>
            Selecciona un archivo de sesión TDD para subir.
          </Typography>
          <input type="file" onChange={handleFileChange} />
          {error && (
            <Typography color="error" variant="body2" style={{ marginTop: "10px" }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleUpload} color="primary" variant="contained">
            Subir
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showSuccessDialog} onClose={handleCloseSuccessDialog}>
        <DialogTitle>Éxito</DialogTitle>
        <DialogContent>
          <Typography variant="body1">¡El archivo se subió correctamente!</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuccessDialog} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FileUploadDialog;
