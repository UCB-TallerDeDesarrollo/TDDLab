import { useState, useRef, useEffect } from "react";
import Button from "@mui/material/Button";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Filter from "./DatePicker";
import { CreateAssignments } from "../../../modules/Assignments/application/CreateAssingment";
import AssignmentsRepository from "../../../modules/Assignments/repository/AssignmentsRepository";
import GetGroups from "../../../modules/Groups/application/GetGroups";
import { GroupDataObject } from "../../../modules/Groups/domain/GroupInterface";
import GroupsRepository from "../../../modules/Groups/repository/GroupsRepository";
import { SelectChangeEvent } from '@mui/material/Select';
import { Warning, CheckCircle } from "@mui/icons-material";

// Componente ValidationDialog
interface ValidationDialogProps {
  open: boolean;
  title: string;
  closeText: string;
  onClose: () => void;
}

const ValidationDialog = ({
  open,
  title,
  closeText,
  onClose,
}: ValidationDialogProps) => {
  const isError = title.toLowerCase().includes('error');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5,
          color: isError ? '#d32f2f' : '#2e7d32',
          fontSize: '1rem',
          fontWeight: 400,
          py: 2,
          fontFamily: '"Roboto","Helvetica","Arial",sans-serif'
        }}
      >
        {isError ? (
          <Warning sx={{ color: '#d32f2f', fontSize: 22 }} />
        ) : (
          <CheckCircle sx={{ color: '#2e7d32', fontSize: 22 }} />
        )}
        {title}
      </DialogTitle>
      <DialogActions sx={{ pb: 2, pr: 2 }}>
        <Button 
          onClick={onClose}
          style={{ 
            color: isError ? '#d32f2f' : '#2e7d32',
            textTransform: 'none',
            fontSize: '0.875rem'
          }}
        >
          {closeText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Componente Form principal
interface CreateAssignmentPopupProps {
  open: boolean;
  handleClose: () => void;
  groupid: number;
}

function Form({ open, handleClose, groupid }: Readonly<CreateAssignmentPopupProps>) {
  const [save, setSave] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [validationMessage, setValidationMessage] = useState("Tarea creada exitosamente");
  const [assignmentData, setAssignmentData] = useState({
    id: 0,
    title: "",
    description: "",
    start_date: new Date(),
    end_date: new Date(),
    state: "pending",
    link: "",
    comment: "",
    groupid: groupid,
  });
  const isCreateButtonClicked = useRef(false);

  const handleSaveClick = async () => {
    setSave(true);
    if (formInvalid()) {
      return;
    }

    isCreateButtonClicked.current = true;
    const assignmentsRepository = new AssignmentsRepository();
    const createAssignments = new CreateAssignments(assignmentsRepository);
    
    if (assignmentData.start_date > assignmentData.end_date) {
      setValidationMessage("Error: La fecha de inicio no puede ser posterior a la fecha de fin");
      setValidationDialogOpen(true);
      setSave(false);
      return;
    }

    try {
      const assignments = await assignmentsRepository.getAssignmentsByGroupid(assignmentData.groupid);
      const duplicateAssignment = assignments.find(
        (assignment) => assignment.title.toLowerCase() === assignmentData.title.toLowerCase()
      );
    
      if (duplicateAssignment) {
        setValidationMessage("Error: Ya existe una tarea con el mismo nombre en este grupo");
        setValidationDialogOpen(true);
        setSave(false);
        return;
      }
    
      await createAssignments.createAssignment(assignmentData);
      setValidationMessage("Tarea creada exitosamente");
      setValidationDialogOpen(true);
    } catch (error) {
      if (error instanceof Error) {
        // Verifica si el mensaje del backend menciona el límite de caracteres
        if (error.message.includes("Limite de caracteres excedido")) {
          setValidationMessage("Error: El título no puede tener más de 50 caracteres.");
        } else {
          setValidationMessage(`Error: ${error.message}`);
        }
      } else {
        setValidationMessage("Error desconocido al crear la tarea.");
      }
      setValidationDialogOpen(true);
    } finally {
      setSave(false);
    }
    
  };

  const handleUpdateDates = (newStartDate: Date, newEndDate: Date) => {
    setAssignmentData((prevData) => ({
      ...prevData,
      start_date: newStartDate,
      end_date: newEndDate,
    }));
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: string,
  ) => {
    const { value } = event.target;
    setAssignmentData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleGroupChange = (event: SelectChangeEvent<number>) => {
    const groupid = event.target.value as number;
    setAssignmentData((prevData) => ({
      ...prevData,
      groupid,
    }));
  };

  const handleCancel = () => {
    handleClose();
  };

  const formInvalid = () => {
    return assignmentData.title.trim() === "" || assignmentData.groupid === 0;
  };

  useEffect(() => {
    setSave(false);
    setAssignmentData({
      id: 0,
      title: "",
      description: "",
      start_date: new Date(),
      end_date: new Date(),
      state: "pending",
      link: "",
      comment: "",
      groupid: groupid,
    });
  }, [open, groupid]);

  const groupRepository = new GroupsRepository();
  const [groups, setGroups] = useState<GroupDataObject[]>([]);
  
  useEffect(() => {
    const fetchGroups = async () => {
      const getGroups = new GetGroups(groupRepository);
      const allGroups = await getGroups.getGroups();
      setGroups(allGroups);
    };

    if (open) {
      fetchGroups();
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      {!validationDialogOpen && (
        <>
          <DialogTitle style={{ fontSize: "0.8rem" }}>Crear tarea</DialogTitle>
          <DialogContent>
            <section className="mb-4">
              <FormControl fullWidth variant="outlined" margin="normal">
                <InputLabel htmlFor="group-select">
                  Grupo
                </InputLabel>
                <Select
                  id="group-select"
                  value={assignmentData.groupid}
                  onChange={handleGroupChange}
                  label="Grupo"
                  error={save && assignmentData.groupid === 0}
                >
                  <MenuItem value={0}>Selecciona un grupo</MenuItem>
                  {groups.map((group) => (
                    <MenuItem key={group.id} value={group.id}>
                      {group.groupName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </section>
            
            <TextField
              error={save && !assignmentData.title.trim()}
              helperText={save && !assignmentData.title.trim() ? "El título es requerido" : ""}
              autoFocus
              margin="dense"
              id="assignment-title"
              name="assignmentTitle"
              label="Nombre de la Tarea*"
              type="text"
              fullWidth
              value={assignmentData.title}
              onChange={(e) => handleInputChange(e, "title")}
              InputLabelProps={{ style: { fontSize: "0.95rem" } }}
            />
            
            <TextField
              multiline
              rows={3.7}
              margin="dense"
              id="assignment-description"
              name="assignmentDescription"
              label="Descripción"
              type="text"
              fullWidth
              value={assignmentData.description}
              onChange={(e) => handleInputChange(e, "description")}
              InputLabelProps={{ style: { fontSize: "0.95rem" } }}
            />
            
            <section className="mt-4">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Filter onUpdateDates={handleUpdateDates} />
              </LocalizationProvider>
            </section>
          </DialogContent>
          
          <DialogActions>
            <Button
              onClick={handleCancel}
              style={{ color: "#555", textTransform: "none" }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveClick}
              color="primary"
              style={{ textTransform: "none" }}
              disabled={formInvalid()}
            >
              Crear
            </Button>
          </DialogActions>
        </>
      )}
      
      {validationDialogOpen && (
        <ValidationDialog
          open={validationDialogOpen}
          title={validationMessage}
          closeText="Cerrar"
          onClose={() => {
            if (!validationMessage.includes("Error")) {
              window.location.reload();
            } else {
              setValidationDialogOpen(false);
            }
          }}
        />
      )}
    </Dialog>
  );
}

export default Form;