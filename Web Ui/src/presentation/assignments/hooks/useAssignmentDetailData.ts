import { useEffect, useRef, useState } from "react";
import { createSearchParams, NavigateFunction } from "react-router-dom";
import { GetAssignmentDetail } from "../../../modules/Assignments/application/GetAssignmentDetail";
import { AssignmentDataObject } from "../../../modules/Assignments/domain/assignmentInterfaces";
import AssignmentsRepository from "../../../modules/Assignments/repository/AssignmentsRepository";
import { GetFeatureFlagByName } from "../../../modules/FeatureFlags/application/GetFeatureFlagByName";
import { GetGroupDetail } from "../../../modules/Groups/application/GetGroupDetail";
import { GroupDataObject } from "../../../modules/Groups/domain/GroupInterface";
import GroupsRepository from "../../../modules/Groups/repository/GroupsRepository";
import { CreateSubmission } from "../../../modules/Submissions/Aplication/createSubmission";
import { FinishSubmission } from "../../../modules/Submissions/Aplication/finishSubmission";
import { GetSubmissionByUserandAssignmentId } from "../../../modules/Submissions/Aplication/getSubmissionByUseridandSubmissionid";
import { GetSubmissionsByAssignmentId } from "../../../modules/Submissions/Aplication/getSubmissionsByAssignmentId";
import {
  SubmissionCreationObject,
  SubmissionDataObject,
  SubmissionUpdateObject,
} from "../../../modules/Submissions/Domain/submissionInterfaces";
import SubmissionRepository from "../../../modules/Submissions/Repository/SubmissionRepository";
import UsersRepository from "../../../modules/Users/repository/UsersRepository";
import { formatDate } from "../../../utils/dateUtils";
import {
  handleRedirectStudent,
  setSelectedMetric,
} from "../../../shared/helpers/navigationHandlers";
import { SubmissionRowView, ViewState } from "../types/assignmentDetail";

function isStudent(role: string) {
  return role === "student";
}

function getDisplayStatus(status: string | undefined) {
  switch (status) {
    case "pending":
      return "Pendiente";
    case "in progress":
      return "En progreso";
    case "delivered":
      return "Enviado";
    case undefined:
      return "Pendiente";
    default:
      return status;
  }
}

function toDisplayDate(value: Date | string | null | undefined) {
  if (!value) {
    return "N/A";
  }

  const normalized = value instanceof Date ? value.toISOString() : value.toString();
  return formatDate(normalized);
}

interface UseAssignmentDetailDataProps {
  role: string;
  userid: number;
  assignmentid: number;
  navigate: NavigateFunction;
}

export function useAssignmentDetailData({
  role,
  userid,
  assignmentid,
  navigate,
}: Readonly<UseAssignmentDetailDataProps>) {
  const [submissionRetry, setSubmissionRetry] = useState(0);
  const [uiMessage, setUiMessage] = useState<string | null>(null);
  const [assignment, setAssignment] = useState<AssignmentDataObject | null>(null);
  const [groupDetails, setGroupDetails] = useState<GroupDataObject | null>(null);
  const [assignmentState, setAssignmentState] = useState<ViewState>("loading");

  const [deliveriesState, setDeliveriesState] = useState<ViewState>("loading");
  const [deliveriesRows, setDeliveriesRows] = useState<SubmissionRowView[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionDataObject[]>([]);

  const [studentSubmission, setStudentSubmission] =
    useState<SubmissionDataObject | null>(null);
  const [submissionLoadState, setSubmissionLoadState] = useState<ViewState>("loading");
  const [loadedSubmissionKey, setLoadedSubmissionKey] = useState("");
  const submissionKey = `${role}:${userid}:${assignmentid}`;
  const currentSubmissionKey = useRef(submissionKey);
  currentSubmissionKey.current = submissionKey;
  const savingSubmission = useRef(false);
  const [isSavingSubmission, setIsSavingSubmission] = useState(false);
  const studentSubmissionState = loadedSubmissionKey === submissionKey
    ? submissionLoadState : "loading";

  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [showIAButton, setShowIAButton] = useState(false);
  useEffect(() => {
    const fetchAssignment = async () => {
      const assignmentsRepository = new AssignmentsRepository();
      const getAssignmentDetail = new GetAssignmentDetail(assignmentsRepository);

      setAssignmentState("loading");

      try {
        const fetchedAssignment = await getAssignmentDetail.obtainAssignmentDetail(
          assignmentid
        );
        setAssignment(fetchedAssignment);
        setAssignmentState("success");
      } catch (error) {
        console.error("Error fetching assignment:", error);
        setAssignmentState("error");
      }
    };

    fetchAssignment();
  }, [assignmentid]);

  useEffect(() => {
    const fetchGroup = async () => {
      if (!assignment?.groupid) {
        return;
      }

      const groupsRepository = new GroupsRepository();
      const getGroupDetail = new GetGroupDetail(groupsRepository);

      try {
        const fetchedGroupDetails = await getGroupDetail.obtainGroupDetail(
          assignment.groupid
        );
        setGroupDetails(fetchedGroupDetails);
      } catch (error) {
        console.error("Error fetching group details:", error);
      }
    };

    fetchGroup();
  }, [assignment]);

  useEffect(() => {
    const fetchStudentFlags = async () => {
      if (!isStudent(role)) {
        return;
      }

      const getFlagUseCase = new GetFeatureFlagByName();

      try {
        const flag = await getFlagUseCase.execute("Boton Asistente IA");
        setShowIAButton(flag?.is_enabled ?? true);
      } catch (error) {
        console.error("Error fetching feature flag IA_ASSISTANT:", error);
      }
    };

    fetchStudentFlags();
  }, [role]);

  useEffect(() => {
    let active = true;
    setLoadedSubmissionKey(submissionKey);
    setSubmissionLoadState("loading");
    setStudentSubmission(null);
    setLinkDialogOpen(false);
    setIsCommentDialogOpen(false);

    const fetchStudentSubmission = async () => {
      if (!isStudent(role)) {
        return;
      }

      if (!Number.isInteger(assignmentid) || !Number.isInteger(userid) || assignmentid <= 0 || userid <= 0) {
        setSubmissionLoadState("error");
        return;
      }

      try {
        const submissionRepository = new SubmissionRepository();
        const submissionData = new GetSubmissionByUserandAssignmentId(submissionRepository);
        const fetchedSubmission =
          await submissionData.getSubmisssionByUserandSubmissionId(assignmentid, userid);
        if (active) {
          setStudentSubmission(fetchedSubmission);
          setSubmissionLoadState("success");
        }
      } catch (error) {
        console.error("Error verifying submission status:", error);
        if (active) setSubmissionLoadState("error");
      }
    };

    fetchStudentSubmission();
    return () => { active = false; };
  }, [assignmentid, userid, role, submissionKey, submissionRetry]);

  useEffect(() => {
    const fetchDeliveries = async () => {
      if (isStudent(role)) {
        return;
      }

      setDeliveriesState("loading");

      try {
        const submissionRepository = new SubmissionRepository();
        const getSubmissionsByAssignmentId = new GetSubmissionsByAssignmentId(
          submissionRepository
        );
        const fetchedSubmissions =
          await getSubmissionsByAssignmentId.getSubmissionsByAssignmentId(assignmentid);

        setSubmissions(fetchedSubmissions);

        const usersRepository = new UsersRepository();
        const mappedRows = await Promise.all(
          fetchedSubmissions.map(async (submissionItem) => {
            try {
              const student = await usersRepository.getUserById(submissionItem.userid);
              const row: SubmissionRowView = {
                id: submissionItem.id,
                email: student.email,
                status: getDisplayStatus(submissionItem.status),
                repositoryLink: submissionItem.repository_link,
                startDate: toDisplayDate(submissionItem.start_date),
                endDate: toDisplayDate(submissionItem.end_date),
                comment: submissionItem.comment || "N/A",
              };
              return row;
            } catch (error) {
              console.error("Error fetching student email:", error);
              const row: SubmissionRowView = {
                id: submissionItem.id,
                email: "Desconocido",
                status: getDisplayStatus(submissionItem.status),
                repositoryLink: submissionItem.repository_link,
                startDate: toDisplayDate(submissionItem.start_date),
                endDate: toDisplayDate(submissionItem.end_date),
                comment: submissionItem.comment || "N/A",
              };
              return row;
            }
          })
        );

        setDeliveriesRows(mappedRows);
        setDeliveriesState(mappedRows.length === 0 ? "empty" : "success");
      } catch (error) {
        console.error("Error fetching SubmissionByAssignmentAndUser:", error);
        setDeliveriesState("error");
      }
    };

    fetchDeliveries();
  }, [assignmentid, role]);

  const canStartTask = studentSubmissionState === "success" && !studentSubmission;
  const canFinishTask = studentSubmissionState === "success" && studentSubmission?.status === "in progress";
  const studentStatusLabel = studentSubmission?.status === "delivered"
    ? "Finalizado" : getDisplayStatus(studentSubmission?.status);

  const openLinkDialog = () => {
    if (canStartTask && !savingSubmission.current) setLinkDialogOpen(true);
  };

  const closeLinkDialog = () => {
    setLinkDialogOpen(false);
  };

  const openCommentDialog = () => {
    if (canFinishTask && !savingSubmission.current) setIsCommentDialogOpen(true);
  };

  const closeCommentDialog = () => {
    setIsCommentDialogOpen(false);
  };

  const sendGithubLink = async (repositoryLink: string) => {
    if (!canStartTask || savingSubmission.current) {
      return;
    }

    const submissionsRepository = new SubmissionRepository();
    const createSubmission = new CreateSubmission(submissionsRepository);
    const startDate = new Date();
    const start_date = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate()
    );

    const submissionData: SubmissionCreationObject = {
      assignmentid,
      userid,
      status: "in progress",
      repository_link: repositoryLink,
      start_date,
    };

    savingSubmission.current = true;
    setIsSavingSubmission(true);
    try {
      const savedSubmission = await createSubmission.createSubmission(submissionData);
      if (currentSubmissionKey.current === submissionKey) {
        setStudentSubmission(savedSubmission);
        closeLinkDialog();
      }
    } finally {
      savingSubmission.current = false;
      setIsSavingSubmission(false);
    }
  };

  const sendComment = async (comment: string) => {
    if (!canFinishTask || !studentSubmission || savingSubmission.current) {
      return;
    }

    const submissionRepository = new SubmissionRepository();
    const finishSubmission = new FinishSubmission(submissionRepository);
    const endDate = new Date();
    const end_date = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate()
    );

    const submissionData: SubmissionUpdateObject = {
      id: studentSubmission.id,
      status: "delivered",
      end_date,
      comment,
    };

    savingSubmission.current = true;
    setIsSavingSubmission(true);
    try {
      const savedSubmission = await finishSubmission.finishSubmission(studentSubmission.id, submissionData);
      if (currentSubmissionKey.current === submissionKey) {
        setStudentSubmission(savedSubmission);
        closeCommentDialog();
      }
    } finally {
      savingSubmission.current = false;
      setIsSavingSubmission(false);
    }
  };

  const redirectStudentToGraph = () => {
    if (!studentSubmission?.repository_link) {
      return;
    }

    setSelectedMetric("Dashboard");
    handleRedirectStudent(
      studentSubmission.repository_link,
      studentSubmission.id,
      navigate,
      setUiMessage
    );
  };

  const redirectStudentToAssistant = () => {
    if (!studentSubmission?.repository_link) {
      return;
    }

    setSelectedMetric("AssistantAI");
    navigate("/asistente-ia", {
      state: { repositoryLink: studentSubmission.repository_link },
    });
  };

  const redirectAdmin = (
    link: string,
    submissionId: number,
    path: string,
    selectedMetric: "Dashboard" | "Complejidad"
  ) => {
    if (!link) {
      setUiMessage("No se encontro un link para esta tarea.");
      return;
    }

    const regex = /https:\/\/github\.com\/([^/]+)\/([^/]+)/;
    const match = regex.exec(link);

    if (!match) {
      setUiMessage("Link invalido, por favor ingrese un link valido.");
      return;
    }

    const [, user, repo] = match;
    setSelectedMetric(selectedMetric);

    navigate({
      pathname: path,
      search: createSearchParams({
        repoOwner: user,
        repoName: repo,
        fetchedSubmissions: JSON.stringify(submissions),
        submissionId: submissionId.toString(),
      }).toString(),
    });
  };

  const openTeacherGraph = (row: SubmissionRowView) => {
    redirectAdmin(row.repositoryLink, row.id, "/graph", "Dashboard");
  };

  const openTeacherAssistant = (row: SubmissionRowView) => {
    navigate("/asistente-ia", {
      state: { repositoryLink: row.repositoryLink },
    });
  };

  return {
    assignment,
    groupDetails,
    assignmentState,
    deliveriesState,
    deliveriesRows,
    studentSubmission,
    studentStatusLabel,
    studentSubmissionState,
    canStartTask,
    canFinishTask,
    isSavingSubmission,
    retryStudentSubmission: () => setSubmissionRetry((value) => value + 1),
    linkDialogOpen,
    isCommentDialogOpen,
    showIAButton,
    isStudent: isStudent(role),
    openLinkDialog,
    closeLinkDialog,
    sendGithubLink,
    openCommentDialog,
    closeCommentDialog,
    sendComment,
    redirectStudentToGraph,
    redirectStudentToAssistant,
    openTeacherGraph,
    openTeacherAssistant,
    studentRepositoryLink: studentSubmission?.repository_link,
    submissionRepositoryLink: studentSubmission?.repository_link,
    uiMessage,
    closeUiMessage: () => setUiMessage(null),
  };
}
