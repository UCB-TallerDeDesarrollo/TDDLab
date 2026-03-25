import { useCallback, useEffect, useMemo, useState } from "react";
import { SelectChangeEvent } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { DeleteAssignment } from "../../../modules/Assignments/application/DeleteAssignment";
import { AssignmentDataObject } from "../../../modules/Assignments/domain/assignmentInterfaces";
import AssignmentsRepository from "../../../modules/Assignments/repository/AssignmentsRepository";
import GetGroups from "../../../modules/Groups/application/GetGroups";
import { GroupDataObject } from "../../../modules/Groups/domain/GroupInterface";
import GroupsRepository from "../../../modules/Groups/repository/GroupsRepository";
import { useGlobalState } from "../../../modules/User-Authentication/domain/authStates";
import {
  normalizeGroupId,
  parseStoredGroupIds,
  resolveInitialGroupId,
  sortAssignments,
} from "../services/assignmentsScreenService";
import {
  AssignmentListProps,
  AssignmentSorting,
} from "../types/assignmentScreen";

async function resolveStudentGroups(params: {
  getGroups: GetGroups;
  authUserId: number;
  userGroupid: number | number[];
}) {
  const storedGroups = localStorage.getItem("userGroups");

  if (storedGroups === null) {
    const studentGroups = params.userGroupid;
    localStorage.setItem("userGroups", JSON.stringify(studentGroups));

    if (Array.isArray(studentGroups)) {
      return Promise.all(
        studentGroups.map((groupId) => params.getGroups.getGroupById(groupId)),
      );
    }

    return Promise.all([params.getGroups.getGroupById(studentGroups)]);
  }

  if (storedGroups === "[0]") {
    const refreshedGroups = await params.getGroups.getGroupsByUserId(
      params.authUserId,
    );
    localStorage.setItem("userGroups", JSON.stringify(refreshedGroups));

    return Promise.all(
      refreshedGroups.map((groupId) => params.getGroups.getGroupById(groupId)),
    );
  }

  const parsedGroups = parseStoredGroupIds(storedGroups);
  return Promise.all(
    parsedGroups.map((groupId) => params.getGroups.getGroupById(groupId)),
  );
}

export function useAssignmentsScreen({
  userRole,
  userGroupid,
  onGroupChange,
}: Readonly<AssignmentListProps>) {
  const navigate = useNavigate();
  const location = useLocation();
  const [authData, setAuthData] = useGlobalState("authData");

  const assignmentsRepository = useMemo(() => new AssignmentsRepository(), []);
  const deleteAssignmentUseCase = useMemo(
    () => new DeleteAssignment(assignmentsRepository),
    [assignmentsRepository],
  );
  const getGroups = useMemo(() => new GetGroups(new GroupsRepository()), []);

  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackSeverity, setFeedbackSeverity] = useState<
    "success" | "error"
  >("success");
  const [selectedSorting, setSelectedSorting] = useState<AssignmentSorting>("");
  const [selectedGroup, setSelectedGroup] = useState(0);
  const [selectedAssignmentIndex, setSelectedAssignmentIndex] = useState<
    number | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [assignments, setAssignments] = useState<AssignmentDataObject[]>([]);
  const [groupList, setGroupList] = useState<GroupDataObject[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const loadAssignmentsForGroup = useCallback(
    async (groupId: number, syncSelection = true) => {
      const normalizedGroupId = groupId === -1 ? 0 : groupId;

      if (syncSelection) {
        setSelectedGroup(normalizedGroupId);
        onGroupChange(groupId);
        localStorage.setItem("selectedGroup", groupId.toString());
        setAuthData({
          ...authData,
          usergroupid: groupId,
        });
      }

      try {
        const nextAssignments =
          normalizedGroupId > 0
            ? await assignmentsRepository.getAssignmentsByGroupid(groupId)
            : await assignmentsRepository.getAssignments();

        setAssignments(nextAssignments);
        setError(null);
        setFeedbackMessage("");
        return nextAssignments;
      } catch (fetchError) {
        const nextError =
          fetchError instanceof Error
            ? fetchError
            : new Error("Error fetching assignments by group ID");

        setAssignments([]);
        setError(nextError);
        console.error("Error fetching assignments by group ID:", fetchError);
        return [];
      }
    },
    [assignmentsRepository, authData, onGroupChange, setAuthData],
  );

  const loadUserGroups = useCallback(async () => {
    if (userRole === "student") {
      return resolveStudentGroups({
        getGroups,
        authUserId: authData.userid ?? -1,
        userGroupid,
      });
    }

    if (userRole === "teacher") {
      const teacherGroupIds = await getGroups.getGroupsByUserId(
        authData.userid ?? -1,
      );

      return Promise.all(
        teacherGroupIds.map((groupId) => getGroups.getGroupById(groupId)),
      );
    }

    if (userRole === "admin") {
      return getGroups.getGroups();
    }

    return [];
  }, [authData.userid, getGroups, userGroupid, userRole]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);

    try {
      const allGroups = await loadUserGroups();
      setGroupList(allGroups);

      const initialGroupId = resolveInitialGroupId({
        locationSearch: location.search,
        storedSelectedGroup: localStorage.getItem("selectedGroup"),
        authGroupId: authData?.usergroupid,
        storedUserGroups: localStorage.getItem("userGroups"),
        fallbackGroups: allGroups,
      });

      if (initialGroupId) {
        await loadAssignmentsForGroup(initialGroupId);
      } else {
        setSelectedGroup(0);
        setAssignments([]);
        setError(null);
      }
    } catch (fetchError) {
      const nextError =
        fetchError instanceof Error
          ? fetchError
          : new Error("Error en fetchData");

      setAssignments([]);
      setGroupList([]);
      setError(nextError);
      setFeedbackMessage("");
      console.error("Error en fetchData:", fetchError);
    } finally {
      setIsLoading(false);
    }
  }, [
    authData?.usergroupid,
    loadAssignmentsForGroup,
    loadUserGroups,
    location.search,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handler = () => {
      const storedGroupId = normalizeGroupId(localStorage.getItem("selectedGroup"));
      const currentGroupId = storedGroupId ?? normalizeGroupId(selectedGroup);

      if (currentGroupId) {
        loadAssignmentsForGroup(currentGroupId, false);
      }
    };

    globalThis.addEventListener("assignment-updated", handler as EventListener);
    return () => {
      globalThis.removeEventListener(
        "assignment-updated",
        handler as EventListener,
      );
    };
  }, [loadAssignmentsForGroup, selectedGroup]);

  const visibleAssignments = useMemo(() => {
    const filteredAssignments = selectedGroup
      ? assignments.filter((assignment) => assignment.groupid === selectedGroup)
      : assignments;

    return sortAssignments(filteredAssignments, selectedSorting);
  }, [assignments, selectedGroup, selectedSorting]);

  const handleOrderAssignments = (event: { target: { value: string } }) => {
    setSelectedSorting(event.target.value as AssignmentSorting);
  };

  const handleGroupChange = async (event: SelectChangeEvent<number>) => {
    const groupId = event.target.value as number;
    await loadAssignmentsForGroup(groupId);
  };

  const handleClickDetail = (index: number) => {
    navigate(`/assignment/${visibleAssignments[index].id}`);
  };

  const handleClickDelete = (index: number) => {
    const assignmentToDelete = visibleAssignments[index];
    const originalIndex = assignments.findIndex(
      (assignment) => assignment.id === assignmentToDelete.id,
    );

    setSelectedAssignmentIndex(originalIndex);
    setConfirmationOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (
      selectedAssignmentIndex === null ||
      !assignments[selectedAssignmentIndex]
    ) {
      setConfirmationOpen(false);
      return;
    }

    try {
      const assignmentToDelete = assignments[selectedAssignmentIndex];
      await deleteAssignmentUseCase.deleteAssignment(assignmentToDelete.id);

      setAssignments((currentAssignments) =>
        currentAssignments.filter(
          (assignment) => assignment.id !== assignmentToDelete.id,
        ),
      );
      setValidationDialogOpen(true);
      setFeedbackMessage("Tarea eliminada exitosamente");
      setFeedbackSeverity("success");
      setError(null);
    } catch (deleteError) {
      const nextError =
        deleteError instanceof Error
          ? deleteError
          : new Error("Error eliminando assignment");

      setError(nextError);
      setFeedbackMessage("No se pudo eliminar la tarea");
      setFeedbackSeverity("error");
      console.error("Error eliminando assignment:", deleteError);
    } finally {
      setConfirmationOpen(false);
      setSelectedAssignmentIndex(null);
    }
  };

  return {
    assignments: visibleAssignments,
    authData,
    confirmationOpen,
    error,
    feedbackMessage,
    feedbackSeverity,
    groupList,
    handleClickDelete,
    handleClickDetail,
    handleConfirmDelete,
    handleGroupChange,
    handleOrderAssignments,
    isLoading,
    selectedGroup,
    selectedSorting,
    setConfirmationOpen,
    setFeedbackMessage,
    setValidationDialogOpen,
    showCreateButton: userRole !== "student",
    validationDialogOpen,
  };
}
