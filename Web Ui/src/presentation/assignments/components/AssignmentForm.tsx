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
import { SelectChangeEvent } from "@mui/material/Select";
import { useAuthStore } from "../../../modules/User-Authentication/domain/authStore";
import { dispatchAssignmentUpdatedEvent } from "../services/assignmentEvents";

function resolveGroupId(prevGroupId: number, list: GroupDataObject[]): number {
  const keepCurrent = list.some((g) => g.id === prevGroupId);
  return keepCurrent ? prevGroupId : (list[0]?.id ?? 0);
}

interface CreateAssignmentPopupProps {
  open: boolean;
  handleClose: () => void;
  groupid: number;
}

function Form({ open, handleClose, groupid }: Readonly<CreateAssignmentPopupProps>) {
  const [save, setSave] = useState(false);
  const auth = useAuthStore((s) => s.authData);
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
      setSave(false);
      return;
    }

    isCreateButtonClicked.current = true;
    const assignmentsRepository = new AssignmentsRepository();
    const createAssignments = new CreateAssignments(assignmentsRepository);

    if (assignmentData.start_date > assignmentData.end_date) {
      alert("Error: La fecha de inicio no puede ser posterior a la fecha de fin");
      setSave(false);
      return;
    }

    try {
      const assignments = await assignmentsRepository.getAssignmentsByGroupid(assignmentData.groupid);
      const duplicateAssignment = assignments.find(
        (assignment) => assignment.title.toLowerCase() === assignmentData.title.toLowerCase()
      );

      if (duplicateAssignment) {
        alert("Error: Ya existe una tarea con el mismo nombre en este grupo");
        setSave(false);
        return;
      }

      await createAssignments.createAssignment(assignmentData);
      dispatchAssignmentUpdatedEvent();
      handleClose();
    } catch (error) {
      console.error(error);
      alert("Error al crear la tarea");
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
      groupid: Math.max(groupid, 0),
    });
  }, [open, groupid]);

  const groupRepository = new GroupsRepository();
  const [groups, setGroups] = useState<GroupDataObject[]>([]);

  useEffect(() => {
    const fetchGroups = async () => {
      const getGroups = new GetGroups(groupRepository);
      let list: GroupDataObject[] = [];

      if (auth?.userRole === "teacher" || auth?.userRole === "student") {
        const ids = await getGroups.getGroupsByUserId(auth.userid ?? -1);
        list = (await Promise.all(ids.map((id: number) => getGroups.getGroupById(id)))).filter(
          (group): group is GroupDataObject => Boolean(group),
        );
      } else if (auth?.userRole === "admin") {
        list = await getGroups.getGroups();
      } else {
        list = [];
      }

      setGroups(list);

      setAssignmentData((prev) => ({
        ...prev,
        groupid: resolveGroupId(prev.groupid, list),
      }));
    };

    if (open) fetchGroups();
  }, [open, auth?.userRole, auth?.userid]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle style={{ fontSize: "0.8rem" }}>Crear tarea</DialogTitle>
      <DialogContent>
        <section className="mb-4">
          <FormControl fullWidth variant="outlined" margin="normal">
            <InputLabel htmlFor="group-select">Grupo</InputLabel>
            <Select
              id="group-select"
              value={assignmentData.groupid}
              onChange={handleGroupChange}
              label="Grupo"
              error={save && assignmentData.groupid === 0}
              MenuProps={{
                PaperProps: { sx: { bgcolor: '#F0F0F0', borderRadius: 1, boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', mt: 0.5 } },
                sx: {
                  '& .MuiMenuItem-root': { backgroundColor: 'transparent' },
                  '& .MuiMenuItem-root:hover': { backgroundColor: '#E6F0FA' },
                  '& .MuiMenuItem-root.Mui-selected': { backgroundColor: 'transparent' },
                  '& .MuiMenuItem-root.Mui-selected:hover': { backgroundColor: '#E6F0FA' },
                  '& .MuiMenuItem-root.Mui-focusVisible': { backgroundColor: 'transparent' }
                }
              }}
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
          disabled={save}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSaveClick}
          color="primary"
          style={{ textTransform: "none" }}
          disabled={save || formInvalid()}
        >
          {save ? "Creando..." : "Crear"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default Form;
