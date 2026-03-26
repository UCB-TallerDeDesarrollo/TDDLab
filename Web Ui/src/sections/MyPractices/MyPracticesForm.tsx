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
import { typographyVariants } from "../../styles/typography";
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
          <DialogTitle style={{ ...typographyVariants.h5 }}>
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
              InputLabelProps={{ style: { ...typographyVariants.paragraphMedium } }}
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
              InputLabelProps={{ style: { ...typographyVariants.paragraphMedium } }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCancel}
              sx={{
                color: "#555",
                textTransform: "none",
                transition: "all 0.175s ease-out",
                "&:hover": {
                  filter: "brightness(0.9)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                },
                "&:active": {
                  transform: "scale(0.97)",
                },
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveClick}
              color="primary"
              sx={{
                textTransform: "none",
                transition: "all 0.175s ease-out",
                "&:hover": {
                  filter: "brightness(0.9)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                },
                "&:active": {
                  transform: "scale(0.97)",
                },
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
