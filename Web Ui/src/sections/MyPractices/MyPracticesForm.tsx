import { useState, useRef, useEffect } from "react";
import Button from "@mui/material/Button";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
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
    if (formInvalid()) {
      return;
    }

    isCreateButtonClicked.current = true;
    const practicesRepository = new PracticesRepository();
    const createPractices = new CreatePractice(practicesRepository);
    try {
      await createPractices.createPractice(practiceData);
    } catch (error) {
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

    setPracticeData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleCancel = () => {
    handleClose();
  };

  const formInvalid = () => {
    return practiceData.title === "";
  };

  useEffect(() => {
    setSave(false);
  }, [open]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      {!validationDialogOpen && (
        <>
          <DialogTitle className="dialog-title-std">
            Crear una Practica
          </DialogTitle>
          <DialogContent className="dialog-content-box">
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
          <DialogActions className="dialog-footer">
            <Button onClick={handleCancel} className="btn-std btn-danger">
              Cancelar
            </Button>
            <Button onClick={handleSaveClick} className="btn-std btn-primary">
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
          onClose={() => window.location.reload()}
        />
      )}
    </Dialog>
  );
}

export default MyPracticesForm;