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
  uniqueGroupIds,
  uniqueGroupsById,
} from "../../../shared/helpers/groupHelpers";
import { addAssignmentUpdatedListener } from "../services/assignmentEvents";
import {
  buildAssignmentListItems,
  resolveInitialGroupId,
  resolveStudentGroupIds,
  sortAssignments,
} from "../services/assignmentsScreenService";
import {
  AssignmentSorting,
} from "../types/assignmentScreen";

export function useAssignmentsScreen({
  userRole,
  userGroupid,
  onGroupChange,
}: Readonly<{
  userRole: string;
  userGroupid: number | number[];
  onGroupChange: (groupId: number) => void;
}>) {
  const navigate = useNavigate();
  const location = useLocation();
  const [authData] = useGlobalState("authData");

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
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(
    null,
  );
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
        try {
          const fallbackAssignments = await assignmentsRepository.getAssignments();
          setAssignments(fallbackAssignments);
          setError(null);
          setFeedbackMessage("");
          console.warn("Falling back to all assignments:", fetchError);
          return fallbackAssignments;
        } catch (fallbackError) {
          setAssignments([]);
          setError(null);
          console.error("Error fetching assignments:", fallbackError);
          return [];
        }
      }
    },
    [assignmentsRepository, onGroupChange],
  );

  const loadUserGroups = useCallback(async () => {
    const loadAvailableGroups = async (groupIds: number[]) => {
      const uniqueIds = uniqueGroupIds(groupIds);
      const groups = await Promise.all(
        uniqueIds.map(async (groupId) => {
          try {
            return await getGroups.getGroupById(groupId);
          } catch (groupError) {
            console.warn("Ignoring unavailable group:", groupId, groupError);
            return null;
          }
        }),
      );

      return uniqueGroupsById(
        groups.filter((group): group is GroupDataObject => Boolean(group)),
      );
    };

    const loadAllGroups = async () => {
      try {
        return uniqueGroupsById(await getGroups.getGroups());
      } catch (groupError) {
        console.warn("Ignoring unavailable groups:", groupError);
        return [];
      }
    };

    if (userRole === "student") {
      const resolvedGroupIds = resolveStudentGroupIds(userGroupid);
      let studentGroupIds = resolvedGroupIds;

      if (studentGroupIds.length === 0) {
        try {
          studentGroupIds = await getGroups.getGroupsByUserId(authData.userid ?? -1);
        } catch (groupError) {
          console.warn("Ignoring unavailable student groups:", groupError);
          studentGroupIds = [];
        }
      }

      return loadAvailableGroups(studentGroupIds);
    }

    if (userRole === "teacher") {
      let teacherGroupIds: number[] = [];
      try {
        teacherGroupIds = await getGroups.getGroupsByUserId(
          authData.userid ?? -1,
        );
      } catch (groupError) {
        console.warn("Ignoring unavailable teacher groups:", groupError);
      }

      return loadAvailableGroups(teacherGroupIds);
    }

    if (userRole === "admin") {
      return loadAllGroups();
    }

    return [];
  }, [authData.userid, getGroups, userGroupid, userRole]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);

    try {
      const allGroups = (await loadUserGroups()).filter(
        (group): group is GroupDataObject => Boolean(group),
      );
      const uniqueGroups = uniqueGroupsById(allGroups);
      setGroupList(uniqueGroups);

      const initialGroupId = resolveInitialGroupId({
        locationSearch: location.search,
        storedSelectedGroup: localStorage.getItem("selectedGroup"),
        authGroupId: Array.isArray(userGroupid) ? userGroupid[0] : userGroupid,
        fallbackGroups: uniqueGroups,
      });

      if (initialGroupId) {
        const normalizedGroupId = initialGroupId === -1 ? 0 : initialGroupId;

        setSelectedGroup(normalizedGroupId);
        onGroupChange(initialGroupId);
        localStorage.setItem("selectedGroup", initialGroupId.toString());

        await loadAssignmentsForGroup(initialGroupId, false);
      } else {
        setSelectedGroup(0);
        onGroupChange(0);
        localStorage.removeItem("selectedGroup");
        setAssignments([]);
        setError(null);
      }
    } catch (fetchError) {
      setAssignments([]);
      setGroupList([]);
      setSelectedGroup(0);
      onGroupChange(0);
      localStorage.removeItem("selectedGroup");
      setError(null);
      setFeedbackMessage("");
      console.error("Error en fetchData:", fetchError);
    } finally {
      setIsLoading(false);
    }
  }, [
    loadAssignmentsForGroup,
    loadUserGroups,
    location.search,
    onGroupChange,
    userGroupid,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    return addAssignmentUpdatedListener(() => {
      loadAssignmentsForGroup(selectedGroup || 0, false);
    });
  }, [loadAssignmentsForGroup, selectedGroup]);

  const visibleAssignments = useMemo(() => {
    const filteredAssignments = selectedGroup
      ? assignments.filter((assignment) => assignment.groupid === selectedGroup)
      : assignments;

    return buildAssignmentListItems(
      sortAssignments(filteredAssignments, selectedSorting),
      groupList,
    );
  }, [assignments, groupList, selectedGroup, selectedSorting]);

  const handleOrderAssignments = (event: { target: { value: string } }) => {
    setSelectedSorting(event.target.value as AssignmentSorting);
  };

  const handleGroupChange = async (event: SelectChangeEvent<number>) => {
    const groupId = event.target.value as number;
    await loadAssignmentsForGroup(groupId);
  };

  const handleClickDetail = (assignmentId: number) => {
    navigate(`/assignment/${assignmentId}`);
  };

  const handleClickDelete = (assignmentId: number) => {
    setSelectedAssignmentId(assignmentId);
    setConfirmationOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedAssignmentId === null) {
      setConfirmationOpen(false);
      return;
    }

    try {
      await deleteAssignmentUseCase.deleteAssignment(selectedAssignmentId);

      setAssignments((currentAssignments) =>
        currentAssignments.filter(
          (assignment) => assignment.id !== selectedAssignmentId,
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
      setSelectedAssignmentId(null);
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
