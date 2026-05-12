import { useState, useEffect, type ChangeEvent } from "react";
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
import { normalizeTextForComparison } from "../../../utils/normalizeText";

interface CreateAssignmentPopupProps {
  open: boolean;
  handleClose: () => void;
  groupid: number;
  "data-testid"?: string;
}

interface AssignmentFormData {
  id: number;
  title: string;
  description: string;
  start_date: Date;
  end_date: Date;
  state: string;
  link: string;
  comment: string;
  groupid: number;
}

const createInitialAssignmentData = (groupid: number): AssignmentFormData => ({
  id: 0,
  title: "",
  description: "",
  start_date: new Date(),
  end_date: new Date(),
  state: "pending",
  link: "",
  comment: "",
  groupid,
});

const isValidGroup = (
  group: GroupDataObject | null | undefined
): group is GroupDataObject => Boolean(group);

const getStoredUserGroupIds = (): number[] => {
  try {
    const storedGroups = JSON.parse(localStorage.getItem("userGroups") ?? "[]");
    return Array.isArray(storedGroups) ? storedGroups : [];
  } catch {
    return [];
  }
};

const fetchGroupsByIds = async (
  getGroups: GetGroups,
  ids: number[]
): Promise<GroupDataObject[]> => {
  const groups = await Promise.all(
    ids.map((id: number) => getGroups.getGroupById(id))
  );

  return groups.filter(isValidGroup);
};

const fetchAvailableGroups = async (
  getGroups: GetGroups,
  userRole?: string,
  userId?: number
): Promise<GroupDataObject[]> => {
  if (userRole === "teacher") {
    const ids = await getGroups.getGroupsByUserId(userId ?? -1);
    return fetchGroupsByIds(getGroups, ids);
  }

  if (userRole === "admin") {
    return getGroups.getGroups();
  }

  if (userRole === "student") {
    const storedIds = getStoredUserGroupIds();
    const ids =
      storedIds.length > 0
        ? storedIds
        : await getGroups.getGroupsByUserId(userId ?? -1);

    return fetchGroupsByIds(getGroups, ids);
  }

  return [];
};

const resolveGroupId = (
  currentGroupId: number,
  availableGroups: GroupDataObject[]
): number => {
  const keepCurrentGroup = availableGroups.some(
    (group) => group.id === currentGroupId
  );

  return keepCurrentGroup ? currentGroupId : availableGroups[0]?.id ?? 0;
};

const getErrorMessage = (error: unknown): string => {
  if (!(error instanceof Error)) {
    return "Error desconocido al crear la tarea.";
  }

  if (error.message.includes("Limite de caracteres excedido")) {
    return "Error: El título no puede tener más de 50 caracteres.";
  }

  return `Error: ${error.message}`;
};

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
  const [groups, setGroups] = useState<GroupDataObject[]>([]);
  const [assignmentData, setAssignmentData] = useState<AssignmentFormData>(
    createInitialAssignmentData(groupid)
  );

  const formInvalid = () =>
    assignmentData.title.trim() === "" || assignmentData.groupid === 0;

  const handleSaveClick = async () => {
    setSave(true);

    if (formInvalid()) return;

    if (assignmentData.start_date > assignmentData.end_date) {
      setValidationMessage(
        "Error: La fecha de inicio no puede ser posterior a la fecha de fin"
      );
      setValidationDialogOpen(true);
      setSave(false);
      return;
    }

    const assignmentsRepository = new AssignmentsRepository();
    const createAssignments = new CreateAssignments(assignmentsRepository);

    try {
      const assignments = await assignmentsRepository.getAssignmentsByGroupid(
        assignmentData.groupid
      );

      const duplicateAssignment = assignments.find(
        (assignment) =>
          normalizeTextForComparison(assignment.title) ===
          normalizeTextForComparison(assignmentData.title)
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
      setValidationMessage(getErrorMessage(error));
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
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof AssignmentFormData
  ) => {
    const { value } = event.target;

    setAssignmentData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleGroupChange = (event: SelectChangeEvent<number>) => {
    const selectedGroupId = Number(event.target.value);

    setAssignmentData((prevData) => ({
      ...prevData,
      groupid: selectedGroupId,
    }));
  };

  const handleCancel = () => handleClose();

  useEffect(() => {
    const effectiveGroupId =
      groupid || Number(localStorage.getItem("selectedGroup") ?? 0) || 0;

    setSave(false);
    setAssignmentData(createInitialAssignmentData(effectiveGroupId));
  }, [open, groupid]);

  useEffect(() => {
    if (!open) return;

    const loadGroups = async () => {
      const getGroups = new GetGroups(new GroupsRepository());
      const list = await fetchAvailableGroups(
        getGroups,
        auth?.userRole,
        auth?.userid
      );

      setGroups(list);

      setAssignmentData((prevData) => ({
        ...prevData,
        groupid: resolveGroupId(prevData.groupid, list),
      }));
    };

    void loadGroups();
  }, [open, auth?.userRole, auth?.userid]);

  const isError = validationMessage.toLowerCase().includes("error");

  const handleValidationClose = () => {
    if (isError) {
      setValidationDialogOpen(false);
      return;
    }

    window.location.reload();
  };

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
              onChange={(event) => handleInputChange(event, "title")}
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
              onChange={(event) => handleInputChange(event, "description")}
            />

            <div className="date-picker-wrapper">
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

      <ValidationDialog
        open={validationDialogOpen}
        title={validationMessage}
        isError={isError}
        closeText="Cerrar"
        onClose={handleValidationClose}
      />
    </Dialog>
  );
}

export default Form;