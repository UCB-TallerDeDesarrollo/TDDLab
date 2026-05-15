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
import DescriptionIcon from '@mui/icons-material/Description';
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
    <Dialog open={open} onClose={handleClose}>
      {!validationDialogOpen && (
        <>
          <DialogTitle>
            Crear una Practica
          </DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              error={formInvalid() && !!save}
              autoFocus
              margin="normal"
              id="title"
              label={
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <DescriptionIcon sx={{ mr: 1 }} />
                  Título de la tarea
                </span>
              }
              variant="outlined"
              fullWidth
              value={practiceData.title}
              onChange={(e) => handleInputChange(e, "title")}
              InputProps={{
                style: { borderRadius: "10px" },
              }}
            />
            <TextField
              multiline
              rows={3.7}
              margin="normal"
              id="practice-description"
              name="practiceDescription"
              label="Descripción"
              type="text"
              fullWidth
              value={practiceData.description}
              onChange={(e) => handleInputChange(e, "description")}
              InputProps={{
                style: { borderRadius: "10px" },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button
              variant="contained"
              color="error"
              onClick={handleCancel}
              sx={{
                flex: 1,
                borderRadius: "10px",
                paddingY: "10px",
                textTransform: "none",
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveClick}
              sx={{
                flex: 1,
                borderRadius: "10px",
                paddingY: "10px",
                textTransform: "none",
              }}
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
          onClose={() => window.location.reload()}
        />
      )}
    </Dialog>
  );
}

export default MyPracticesForm;
