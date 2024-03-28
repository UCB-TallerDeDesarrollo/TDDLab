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
import { ValidationDialog } from "../../Shared/Components/ValidationDialog";
import GetGroups from "../../../modules/Groups/application/GetGroups";
import { GroupDataObject } from "../../../modules/Groups/domain/GroupInterface";
import GroupsRepository from "../../../modules/Groups/repository/GroupsRepository";
import { SelectChangeEvent } from '@mui/material/Select';
interface CreateAssignmentPopupProps {
  open: boolean;
  handleClose: () => void;
}

function Form({ open, handleClose }: Readonly<CreateAssignmentPopupProps>) {
  const [save, setSave] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    id: 0,
    title: "",
    description: "",
    start_date: new Date(),
    end_date: new Date(),
    state: "pending",
    link: "",
    comment: "",
    groupid: 0, // Nuevo campo para el ID del grupo
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
      return;
    }
    try {
      await createAssignments.createAssignment(assignmentData);
      
    } catch (error) {
      console.error(error);
    } finally {
      setSave(false);
    }
    setValidationDialogOpen(true);
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
    field: string, // 'title' or 'description'
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
    return assignmentData.title === "" || assignmentData.groupid === 0;
  };

  useEffect(() => {
    setSave(false);
  }, [open]);

  const groupRepository = new GroupsRepository();
  const [groups, setGroups] = useState<GroupDataObject[]>([]);
  useEffect(() => {
    const fetchGroups = async () => {
      const getGroups = new GetGroups(groupRepository);
      const allGroups = await getGroups.getGroups();
      setGroups(allGroups);
    };

    fetchGroups();
  });
  return (
    <Dialog open={open} onClose={handleClose}>
      {!validationDialogOpen && (
        <>
          <DialogTitle style={{ fontSize: "0.8 rem" }}>Crear tarea</DialogTitle>
          <DialogContent>
          <section>
            <FormControl fullWidth variant="outlined">
              <InputLabel htmlFor="group-select" id="group-select-label">
                Grupo
              </InputLabel>
              <Select
                labelId="group-select-label"
                id="group-select"
                value={assignmentData.groupid}
                onChange={handleGroupChange}
                label="Grupo"
                fullWidth
                style={{ visibility: 'visible' }}  // Hacer visible el desplegable siempre
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
              error={formInvalid() && !!save}
              autoFocus
              margin="dense"
              id="assigment-title"
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
            <section>
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
            >
              Crear
            </Button>
          </DialogActions>
        </>
      )}
      {!!validationDialogOpen && (
        <ValidationDialog
          open={validationDialogOpen}
          title="Tarea creada exitosamente"
          closeText="Cerrar"
          onClose={() => window.location.reload()}
        />
      )}
    </Dialog>
  );
}

export default Form;

