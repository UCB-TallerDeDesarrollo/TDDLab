import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CircularProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Container,
  SelectChangeEvent,
} from "@mui/material";
import AssignmentsRepository from "../../../modules/Assignments/repository/AssignmentsRepository";

import { styled } from "@mui/system";
import { AssignmentDataObject } from "../../../modules/Assignments/domain/assignmentInterfaces";
import { DeleteAssignment } from "../../../modules/Assignments/application/DeleteAssignment";
import { ConfirmationDialog } from "../../Shared/Components/ConfirmationDialog";
import { ValidationDialog } from "../../Shared/Components/ValidationDialog";
import Assignment from "./Assignment";
import SortingComponent from "../../GeneralPurposeComponents/SortingComponent";
import GroupFilter from "./GroupFilter";
import { GroupDataObject } from "../../../modules/Groups/domain/GroupInterface";
import GroupsRepository from "../../../modules/Groups/repository/GroupsRepository";
import GetGroups from "../../../modules/Groups/application/GetGroups";
import { useGlobalState } from "../../../modules/User-Authentication/domain/authStates";
import CreateButton from "../../GeneralPurposeComponents/CreateButton";

const StyledTable = styled(Table)({
  width: "100%",
  marginLeft: "auto",
  marginRight: "auto",
});

const CustomTableCell1 = styled(TableCell)({
  width: "100%",
});

const LoadingContainer = styled("div")({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
});

interface AssignmentsProps {
  ShowForm: () => void;
  userRole: string;
  userGroupid: number | number[];
  onGroupChange: (groupId: number) => void;
}

function Assignments({
  ShowForm: showForm,
  userRole,
  userGroupid,
  onGroupChange,
}: Readonly<AssignmentsProps>) {
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [selectedSorting, setSelectedSorting] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<number>(0);
  const [selectedAssignmentIndex, setSelectedAssignmentIndex] = useState<
    number | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setDeleteLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [_hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [assignments, setAssignments] = useState<AssignmentDataObject[]>([]);
  const assignmentsRepository = new AssignmentsRepository();

  const deleteAssignmentUseCase = new DeleteAssignment(assignmentsRepository);

  const [groupList, setGroupList] = useState<GroupDataObject[]>([]);
  const groupRepository = new GroupsRepository();
  const getGroups = new GetGroups(groupRepository);
  const [authData, setAuthData] = useGlobalState("authData");

  const orderAssignments = (
    assignmentsArray: AssignmentDataObject[],
    selectedSorting: string
  ) => {
    if (assignmentsArray.length == 0) {
      return;
    }
    if (selectedSorting === "A_Up_Order") {
      assignmentsArray.sort((a, b) => a.title.localeCompare(b.title));
    } else if (selectedSorting === "A_Down_Order") {
      assignmentsArray.sort((a, b) => b.title.localeCompare(a.title));
    } else if (selectedSorting === "Time_Up") {
      assignmentsArray.sort((a, b) => b.id - a.id);
    } else if (selectedSorting === "Time_Down") {
      assignmentsArray.sort((a, b) => a.id - b.id);
    }
    setAssignments(assignmentsArray);
  };

  async function getUserGroups() {
    setIsLoading(true);
    let allGroups: GroupDataObject[] = [];
    if (userRole === "student") {
      if (localStorage.getItem("userGroups") === null) {
        const studentGroups = userGroupid;
        localStorage.setItem("userGroups", JSON.stringify(studentGroups));
        if (Array.isArray(studentGroups)) {
          allGroups = await Promise.all(
            studentGroups.map((group) => getGroups.getGroupById(group))
          );
        } else {
          allGroups = await Promise.all([getGroups.getGroupById(studentGroups)]);
        }
      } else if (localStorage.getItem("userGroups") === "[0]") {
        const studentGroups = await getGroups.getGroupsByUserId(authData.userid ?? -1);
        localStorage.setItem("userGroups", JSON.stringify(studentGroups));
        allGroups = await Promise.all(
          studentGroups.map((group) => getGroups.getGroupById(group))
        );
      } else {
        const studentGroups: number[] = JSON.parse(
          localStorage.getItem("userGroups") ?? "[]"
        );
        allGroups = await Promise.all(
          studentGroups.map((group) => getGroups.getGroupById(group))
        );
      }
    } else if (userRole === "teacher") {
      const teacherGroupIds = await getGroups.getGroupsByUserId(authData.userid ?? -1);
      allGroups = await Promise.all(
        teacherGroupIds.map((id) => getGroups.getGroupById(id))
      );
    } else if (userRole === "admin") {
      allGroups = await getGroups.getGroups();
    }

    if (selectedGroup === 0 && allGroups.length > 0 && !isLoading) {
      await loadAssignmentsByGroupId(allGroups[0].id);
    }

    setIsLoading(false);
    return allGroups;
  }

  const fetchData = async () => {
    try {
      const allGroups = await getUserGroups();
      setGroupList(allGroups);

      const groupIdFromURL = new URLSearchParams(globalThis.location.search).get("groupId");
      const groupIdUrl = groupIdFromURL ? Number(groupIdFromURL) : null;

      const savedSelectedGroup = localStorage.getItem("selectedGroup");
      const groupIdLocal = savedSelectedGroup ? Number(savedSelectedGroup) : null;
      const groupIdAuth = authData?.usergroupid ?? null;

      let firstUserGroup: number | null = null;
      try {
        const storedUserGroups = JSON.parse(localStorage.getItem("userGroups") || "[]");
        if (Array.isArray(storedUserGroups) && storedUserGroups.length > 0) {
          firstUserGroup = storedUserGroups[0];
        }
      } catch {}

      const finalGroupId =
        groupIdUrl ||
        groupIdLocal ||
        groupIdAuth ||
        firstUserGroup ||
        allGroups?.[0]?.id ||
        null;

      if (finalGroupId) {
        await loadAssignmentsByGroupId(finalGroupId);
      } else {
        setSelectedGroup(0);
        setAssignments([]);
      }
    } catch (error) {
      console.error("Error en fetchData:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [location]);

  useEffect(() => {
    const handler = () => {
      const savedSelectedGroup = localStorage.getItem("selectedGroup");
      const groupId = savedSelectedGroup ? Number(savedSelectedGroup) : selectedGroup;
      if (groupId) {
        loadAssignmentsByGroupId(groupId);
      }
    };
    globalThis.addEventListener("assignment-updated", handler as EventListener);
    return () =>
      globalThis.removeEventListener("assignment-updated", handler as EventListener);
  }, [selectedGroup]);

  useEffect(() => {
    const fetchAssignmentsByGroup = async () => {
      try {
        const savedSelectedGroup = localStorage.getItem("selectedGroup");
        const preferredGroupId = savedSelectedGroup
          ? parseInt(savedSelectedGroup, 10)
          : authData?.usergroupid;

        if (preferredGroupId === undefined || preferredGroupId === null) {
          return;
        }

        const data = await assignmentsRepository.getAssignmentsByGroupid(preferredGroupId);
        setSelectedGroup(preferredGroupId == -1 ? 0 : preferredGroupId);
        setAssignments(data);
        orderAssignments([...data], selectedSorting);
      } catch (error) {
        console.error("Error fetching assignments:", error);
      }
    };

    fetchAssignmentsByGroup();
  }, [authData, selectedSorting]);

  const handleOrderAssignments = (event: { target: { value: string } }) => {
    setSelectedSorting(event.target.value);
    orderAssignments([...assignments], event.target.value);
  };

  const loadAssignmentsByGroupId = async (groupId: number) => {
    setSelectedGroup(groupId == -1 ? 0 : groupId);
    onGroupChange(groupId);

    localStorage.setItem("selectedGroup", groupId.toString());

    const updatedAuthData = { ...authData, usergroupid: groupId };
    setAuthData(updatedAuthData);

    try {
      const updatedGroupId = updatedAuthData.usergroupid;
      if (updatedGroupId !== undefined) {
        const assignments = await assignmentsRepository.getAssignmentsByGroupid(updatedGroupId);
        setAssignments(assignments);
      } else {
        const assignments = await assignmentsRepository.getAssignments();
        setAssignments(assignments);
      }
    } catch (error) {
      console.error("Error fetching assignments by group ID:", error);
    }
  };

  const handleGroupChange = async (event: SelectChangeEvent<number>) => {
    const groupId = event.target.value as number;
    await loadAssignmentsByGroupId(groupId);
  };

  const filteredAssignments = selectedGroup
    ? assignments.filter((assignment) => assignment.groupid === selectedGroup)
    : assignments;

  const handleClickDetail = (index: number) => {
    navigate(`/assignment/${filteredAssignments[index].id}`);
  };

  const handleClickDelete = (index: number) => {
    const assignmentToDelete = filteredAssignments[index];
    const originalIndex = assignments.indexOf(assignmentToDelete);
    setSelectedAssignmentIndex(originalIndex);
    setConfirmationOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedAssignmentIndex === null || !assignments[selectedAssignmentIndex]) {
      setConfirmationOpen(false);
      return;
    }

    setDeleteLoading(true);

    try {
      const assignmentToDelete = assignments[selectedAssignmentIndex];
      console.log("Eliminando assignment:", assignmentToDelete);

      const resutlt = await deleteAssignmentUseCase.deleteAssignment(assignmentToDelete.id);
      console.log("Resultado obtenido al intentar eliminar eliminar:", resutlt);

      setValidationDialogOpen(true);
    } catch (error: any) {
      console.error("Error eliminando assignment:", error);
    } finally {
      setConfirmationOpen(false);
      setDeleteLoading(false);
      setSelectedAssignmentIndex(null);
    }
  };

  const handleRowHover = (index: number | null) => {
    setHoveredRow(index);
  };

  return (
    <Container>
      {isLoading ? (
        <LoadingContainer>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
              width: "100vw",
            }}
          >
            <CircularProgress />
          </div>
        </LoadingContainer>
      ) : (
        <section className="Tareas">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              marginBottom: "16px",
              marginLeft: "15px",
            }}
          >
            <span
              style={{
                fontWeight: 560,
                color: "#333",
                fontSize: "1.4rem",
              }}
            >
              Tareas
            </span>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginRight: "45px",
                flexWrap: "nowrap",
              }}
            >
              <GroupFilter
                selectedGroup={selectedGroup}
                groupList={groupList}
                onChangeHandler={handleGroupChange}
                defaultName={
                  groupList.find((group) => group.id == selectedGroup)?.groupName ||
                  groupList[0]?.groupName ||
                  "Selecciona un grupo"
                }
              />
              <SortingComponent
                selectedSorting={selectedSorting}
                onChangeHandler={handleOrderAssignments}
              />
              {userRole !== "student" && (
                <CreateButton
                  onClick={showForm}
                  label="Crear"
                  minWidth="90px"
                />
              )}
            </div>
          </div>

          <StyledTable>
            <TableHead>
              <TableRow
                sx={{
                  borderBottom: "2px solid #000000",
                }}
              >
                <CustomTableCell1 sx={{ padding: "10px 0" }}></CustomTableCell1>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAssignments.map((assignment, index) => (
                <Assignment
                  key={assignment.id}
                  assignment={assignment}
                  index={index}
                  handleClickDetail={handleClickDetail}
                  handleClickDelete={handleClickDelete}
                  handleRowHover={handleRowHover}
                  role={userRole}
                />
              ))}
            </TableBody>
          </StyledTable>

          {confirmationOpen && (
            <ConfirmationDialog
              open={confirmationOpen}
              title="¿Eliminar la tarea?"
              content={
                <>
                  Ten en cuenta que esta acción también eliminará <br /> todas las
                  entregas asociadas.
                </>
              }
              cancelText="Cancelar"
              deleteText="Eliminar"
              onCancel={() => setConfirmationOpen(false)}
              onDelete={handleConfirmDelete}
            />
          )}
          {validationDialogOpen && (
            <ValidationDialog
              open={validationDialogOpen}
              title="Tarea eliminada exitosamente"
              closeText="Cerrar"
              onClose={() => {
                setValidationDialogOpen(false);
                if (selectedGroup) {
                  loadAssignmentsByGroupId(selectedGroup);
                } else if (authData?.usergroupid) {
                  loadAssignmentsByGroupId(authData.usergroupid);
                }
              }}
            />
          )}
        </section>
      )}
    </Container>
  );
}

export default Assignments;