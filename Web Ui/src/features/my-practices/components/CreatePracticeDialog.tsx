import { useState, useRef, useEffect } from "react";
import Button from "@mui/material/Button";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { createPractice } from "../services/practicesService";
import { ValidationDialog } from "../../../sections/Shared/Components/ValidationDialog";

interface CreatePracticeDialogProps {
  open: boolean;
  handleClose: () => void;
  userid: number;
  onCreated: () => void;
}

function CreatePracticeDialog({
  open,
  handleClose,
  userid,
  onCreated,
}: Readonly<CreatePracticeDialogProps>) {
  const [save, setSave] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [createdSuccessfully, setCreatedSuccessfully] = useState(false);
  const [practiceData, setPracticeData] = useState({
    id: 0,
    title: "",
    description: "",
    state: "pending",
    creation_date: new Date(),
    userid: userid,
  });
  const isCreateButtonClicked = useRef(false);

  const formInvalid = () => practiceData.title === "";

  const handleSaveClick = async () => {
    setSave(true);
    if (formInvalid()) return;

    isCreateButtonClicked.current = true;
    try {
      await createPractice(practiceData);
      setCreatedSuccessfully(true);
    } catch (error) {
      setCreatedSuccessfully(false);
      console.error(error);
    } finally {
      setSave(false);
    }
    setValidationDialogOpen(true);
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: string
  ) => {
    const { value } = event.target;
    setPracticeData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    setSave(false);
    setCreatedSuccessfully(false);
  }, [open]);

  return (
    <Dialog open={open} onClose={handleClose}>
      {!validationDialogOpen && (
        <>
          <DialogTitle style={{ fontSize: "0.8rem" }}>
            Crear una Practica
          </DialogTitle>
          <DialogContent>
            <TextField
              error={formInvalid() && !!save}
              autoFocus
              margin="dense"
              id="assigment-title"
              name="practiceTitle"
              label="Nombre de la Practica*"
              type="text"
              fullWidth
              value={practiceData.title}
              onChange={(e) => handleInputChange(e, "title")}
              InputLabelProps={{ style: { fontSize: "0.95rem" } }}
            />
            <TextField
              multiline
              rows={3.7}
              margin="dense"
              id="practice-description"
              name="practiceDescription"
              label="Descripción"
              type="text"
              fullWidth
              value={practiceData.description}
              onChange={(e) => handleInputChange(e, "description")}
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
            >
              Crear
            </Button>
          </DialogActions>
        </>
      )}
      {!!validationDialogOpen && (
        <ValidationDialog
          open={validationDialogOpen}
          title="Practica creada exitosamente"
          closeText="Cerrar"
          onClose={() => {
            setValidationDialogOpen(false);
            handleClose();
            if (createdSuccessfully) {
              onCreated();
            }
          }}
        />
      )}
    </Dialog>
  );
}

export default CreatePracticeDialog;
