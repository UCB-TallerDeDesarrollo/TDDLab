import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import ValidationDialog from "../../../shared/components/ValidationDialog";

interface CreatePracticePopupProps {
  open: boolean;
  handleClose: () => void;
  userid: number;
  isSaving: boolean;
  onCreate: (input: {
    title: string;
    description: string;
    userid: number;
  }) => Promise<void>;
}

function MyPracticesForm({
  open,
  handleClose,
  userid,
  isSaving,
  onCreate,
}: Readonly<CreatePracticePopupProps>) {
  const [saveAttempted, setSaveAttempted] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [validationMessage, setValidationMessage] = useState(
    "Practica creada exitosamente",
  );
  const [practiceData, setPracticeData] = useState({
    title: "",
    description: "",
    userid,
  });

  const handleSaveClick = async () => {
    setSaveAttempted(true);
    if (practiceData.title.trim() === "") {
      return;
    }

    try {
      await onCreate(practiceData);
      setValidationMessage("Practica creada exitosamente");
      setValidationDialogOpen(true);
    } catch (error) {
      console.error(error);
      setValidationMessage("Error al crear la practica");
      setValidationDialogOpen(true);
    }
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: "title" | "description",
  ) => {
    const { value } = event.target;

    setPracticeData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    setSaveAttempted(false);
    setValidationDialogOpen(false);
    setPracticeData({
      title: "",
      description: "",
      userid,
    });
  }, [open, userid]);

  return (
    <Dialog open={open} onClose={handleClose}>
      {!validationDialogOpen ? (
        <>
          <DialogTitle style={{ fontSize: "0.8 rem" }}>
            Crear una Practica
          </DialogTitle>
          <DialogContent>
            <TextField
              error={saveAttempted && practiceData.title.trim() === ""}
              autoFocus
              margin="dense"
              id="practice-title"
              name="practiceTitle"
              label="Nombre de la Practica*"
              type="text"
              fullWidth
              value={practiceData.title}
              onChange={(event) => handleInputChange(event, "title")}
              InputLabelProps={{ style: { fontSize: "0.95rem" } }}
            />
            <TextField
              multiline
              rows={4}
              margin="dense"
              id="practice-description"
              name="practiceDescription"
              label="Descripcion"
              type="text"
              fullWidth
              value={practiceData.description}
              onChange={(event) => handleInputChange(event, "description")}
              InputLabelProps={{ style: { fontSize: "0.95rem" } }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleClose}
              style={{ color: "#555", textTransform: "none" }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveClick}
              color="primary"
              style={{ textTransform: "none" }}
              disabled={isSaving || practiceData.title.trim() === ""}
            >
              {isSaving ? "Creando..." : "Crear"}
            </Button>
          </DialogActions>
        </>
      ) : null}
      {validationDialogOpen ? (
        <ValidationDialog
          open={validationDialogOpen}
          title={validationMessage}
          closeText="Cerrar"
          onClose={() => {
            setValidationDialogOpen(false);
            if (!validationMessage.toLowerCase().includes("error")) {
              handleClose();
            }
          }}
        />
      ) : null}
    </Dialog>
  );
}

export default MyPracticesForm;
