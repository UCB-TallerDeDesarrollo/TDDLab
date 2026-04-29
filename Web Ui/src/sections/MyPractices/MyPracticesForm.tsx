import { useState, useRef, useEffect } from "react";
import Button from "@mui/material/Button";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import { CreatePractice } from "../../modules/Practices/application/CreatePractice";
import PracticesRepository from "../../modules/Practices/repository/PracticesRepository";
import { ValidationDialog } from "../Shared/Components/ValidationDialog";
import "../../App.css";

interface CreatePracticePopupProps {
  open: boolean;
  handleClose: () => void;
  userid: number;
}

function MyPracticesForm({
  open,
  handleClose,
  userid,
}: Readonly<CreatePracticePopupProps>) {
  const [save, setSave] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [errorToastOpen, setErrorToastOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [practiceData, setPracticeData] = useState({
    id: 0,
    title: "",
    description: "",
    state: "pending",
    creation_date: new Date(),
    userid: userid,
  });
  const isCreateButtonClicked = useRef(false);

  const handleSaveClick = async () => {
    setSave(true);
    if (formInvalid()) return;

    isCreateButtonClicked.current = true;
    const practicesRepository = new PracticesRepository();
    const createPractices = new CreatePractice(practicesRepository);
    try {
      await createPractices.createPractice(practiceData);
      setValidationDialogOpen(true);
    } catch (error) {
      console.error(error);
      const isDuplicate = (error as { response?: { status?: number } }).response?.status === 409;
      setErrorMessage(
        isDuplicate
          ? "Ya existe una práctica con ese nombre."
          : "No se pudo crear la práctica. Intenta nuevamente."
      );
      setErrorToastOpen(true);
    } finally {
      setSave(false);
    }
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: string
  ) => {
    const { value } = event.target;
    setPracticeData((prevData) => ({ ...prevData, [field]: value }));
  };

  const handleCancel = () => handleClose();

  const formInvalid = () => practiceData.title === "";

  useEffect(() => {
    setSave(false);
  }, [open]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      {!validationDialogOpen && (
        <>
          <DialogTitle className="dialog-title-std">
            Crear una Práctica
          </DialogTitle>

          <DialogContent className="dialog-content-box">
            <TextField
              error={formInvalid() && !!save}
              autoFocus
              margin="dense"
              id="practice-title"
              name="practiceTitle"
              label="Nombre de la Práctica*"
              type="text"
              fullWidth
              value={practiceData.title}
              onChange={(e) => handleInputChange(e, "title")}
              InputLabelProps={{ style: { fontSize: "0.95rem" } }}
              helperText={formInvalid() && !!save ? "El nombre de la práctica es requerido" : ""}
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

          <DialogActions className="dialog-footer">
            <Button onClick={handleCancel} className="btn-std btn-secondary">
              Cancelar
            </Button>
            <Button onClick={handleSaveClick} className="btn-std btn-primary">
              Crear
            </Button>
          </DialogActions>
        </>
      )}

      <ValidationDialog
        open={validationDialogOpen}
        title="Práctica creada exitosamente"
        closeText="Cerrar"
        onClose={() => window.location.reload()}
      />

      <Snackbar
        open={errorToastOpen}
        autoHideDuration={4000}
        onClose={() => setErrorToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setErrorToastOpen(false)}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}

export default MyPracticesForm;
