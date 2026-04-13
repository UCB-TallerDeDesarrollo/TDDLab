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
import { useGlobalState } from "../../../modules/User-Authentication/domain/authStates";
import { ValidationDialog } from "../../Shared/Components/ValidationDialog";

// ─── Form principal ───────────────────────────────────────────────────────────
interface CreateAssignmentPopupProps {
  open: boolean;
  handleClose: () => void;
  groupid: number;
  "data-testid"?: string;
}

function Form({
  open,
  handleClose,
  groupid,
  "data-testid": testId,
}: Readonly<CreateAssignmentPopupProps>) {
  const [save, setSave] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [validationMessage, setValidationMessage] = useState(
    "Tarea creada exitosamente"
  );
  const [auth] = useGlobalState("authData");
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
    if (formInvalid()) return;

    isCreateButtonClicked.current = true;
    const assignmentsRepository = new AssignmentsRepository();
    const createAssignments = new CreateAssignments(assignmentsRepository);

    if (assignmentData.start_date > assignmentData.end_date) {
      setValidationMessage(
        "Error: La fecha de inicio no puede ser posterior a la fecha de fin"
      );
      setValidationDialogOpen(true);
      setSave(false);
      return;
    }

    try {
      const assignments = await assignmentsRepository.getAssignmentsByGroupid(
        assignmentData.groupid
      );
      const duplicateAssignment = assignments.find(
        (assignment) =>
          assignment.title.toLowerCase() === assignmentData.title.toLowerCase()
      );
      if (duplicateAssignment) {
        setValidationMessage(
          "Error: Ya existe una tarea con el mismo nombre en este grupo"
        );
        setValidationDialogOpen(true);
        setSave(false);
        return;
      }
      await createAssignments.createAssignment(assignmentData);
      setValidationMessage("Tarea creada exitosamente");
      setValidationDialogOpen(true);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Limite de caracteres excedido")) {
          setValidationMessage(
            "Error: El título no puede tener más de 50 caracteres."
          );
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
    field: string
  ) => {
    const { value } = event.target;
    setAssignmentData((prevData) => ({ ...prevData, [field]: value }));
  };

  const handleGroupChange = (event: SelectChangeEvent<number>) => {
    const groupid = event.target.value as number;
    setAssignmentData((prevData) => ({ ...prevData, groupid }));
  };

  const handleCancel = () => handleClose();

  const formInvalid = () =>
    assignmentData.title.trim() === "" || assignmentData.groupid === 0;

  useEffect(() => {
    const effectiveGroupId =
      groupid || Number(localStorage.getItem("selectedGroup") ?? 0) || 0;
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
      groupid: effectiveGroupId,
    });
  }, [open, groupid]);

  const groupRepository = new GroupsRepository();
  const [groups, setGroups] = useState<GroupDataObject[]>([]);

  useEffect(() => {
    const fetchGroups = async () => {
      const getGroups = new GetGroups(groupRepository);
      let list: GroupDataObject[] = [];
      if (auth?.userRole === "teacher") {
        const ids = await getGroups.getGroupsByUserId(auth.userid ?? -1);
        list = (
          await Promise.all(
            ids.map((id: number) => getGroups.getGroupById(id))
          )
        ).filter(Boolean) as GroupDataObject[];
      } else if (auth?.userRole === "admin") {
        list = await getGroups.getGroups();
      } else if (auth?.userRole === "student") {
        let ids: number[] = [];
        try {
          const fromLS = JSON.parse(
            localStorage.getItem("userGroups") ?? "[]"
          );
          if (Array.isArray(fromLS) && fromLS.length) ids = fromLS;
        } catch {}
        if (!ids.length)
          ids = await getGroups.getGroupsByUserId(auth.userid ?? -1);
        list = (
          await Promise.all(
            ids.map((id: number) => getGroups.getGroupById(id))
          )
        ).filter(Boolean) as GroupDataObject[];
      }
      setGroups(list);
      setAssignmentData((prev) => {
        const keepCurrent = list.some((g) => g.id === prev.groupid);
        return {
          ...prev,
          groupid: keepCurrent ? prev.groupid : list[0]?.id ?? 0,
        };
      });
    };
    if (open) fetchGroups();
  }, [open, auth?.userRole, auth?.userid]);

  const isError = validationMessage.toLowerCase().includes("error");

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ "data-testid": testId }}
    >
      {!validationDialogOpen && (
        <>
          <DialogTitle className="dialog-title-std">Crear tarea</DialogTitle>
          <DialogContent className="dialog-content-box">
            <FormControl fullWidth variant="outlined" margin="dense">
              <InputLabel htmlFor="group-select">Grupo</InputLabel>
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

            <TextField
              error={save && !assignmentData.title.trim()}
              helperText={
                save && !assignmentData.title.trim()
                  ? "El título es requerido"
                  : ""
              }
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

            <div style={{ marginTop: "10px" }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Filter onUpdateDates={handleUpdateDates} />
              </LocalizationProvider>
            </div>
          </DialogContent>

          <DialogActions className="dialog-footer">
            <Button onClick={handleCancel} className="btn-std btn-secondary">
              Cancelar
            </Button>
            <Button
              onClick={handleSaveClick}
              className="btn-std btn-primary"
              disabled={formInvalid()}
            >
              Crear
            </Button>
          </DialogActions>
        </>
      )}

      {/* Usa el ValidationDialog compartido — soporta éxito y error vía prop title */}
      <ValidationDialog
        open={validationDialogOpen}
        title={validationMessage}
        isError={isError}
        closeText="Cerrar"
        onClose={() => {
          if (!isError) {
            window.location.reload();
          } else {
            setValidationDialogOpen(false);
          }
        }}
      />
    </Dialog>
  );
}

export default Form;
