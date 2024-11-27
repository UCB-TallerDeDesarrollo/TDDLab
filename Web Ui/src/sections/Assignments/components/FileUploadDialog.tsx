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
  onUpload: (file: File) => void;
}

const FileUploadDialog: React.FC<FileUploadDialogProps> = ({
  open,
  onClose,
  onUpload,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    } else {
      setError("No file selected");
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
      onClose();
    } else {
      setError("Please select a file before uploading.");
    }
  };

  return (
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
  );
};

export default FileUploadDialog;
