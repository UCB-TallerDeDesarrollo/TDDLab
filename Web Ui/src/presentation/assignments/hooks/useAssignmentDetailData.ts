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
  const [refreshTick, setRefreshTick] = useState(0);
  const [uiMessage, setUiMessage] = useState<string | null>(null);
  const [submissionErrorMessage, setSubmissionErrorMessage] = useState<string | null>(null);
  const [assignment, setAssignment] = useState<AssignmentDataObject | null>(null);
  const [groupDetails, setGroupDetails] = useState<GroupDataObject | null>(null);
  const [assignmentState, setAssignmentState] = useState<ViewState>("loading");

  const [deliveriesState, setDeliveriesState] = useState<ViewState>("loading");
  const [deliveriesRows, setDeliveriesRows] = useState<SubmissionRowView[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionDataObject[]>([]);

  const [studentSubmission, setStudentSubmission] =
    useState<SubmissionDataObject | null>(null);
  const [studentSubmissionState, setStudentSubmissionState] =
    useState<ViewState>("loading");
  const [submission, setSubmission] = useState<SubmissionDataObject | null>(null);

  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [isSubmissionMutationPending, setIsSubmissionMutationPending] =
    useState(false);
  const submissionMutationInProgress = useRef(false);
  const [showIAButton, setShowIAButton] = useState(false);
  const [disableAdditionalGraphs, setDisableAdditionalGraphs] = useState(true);

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
  }, [assignmentid, refreshTick]);

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
  }, [assignment, refreshTick]);

  useEffect(() => {
    const fetchTeacherFlags = async () => {
      if (isStudent(role)) {
        return;
      }

      const getFlagUseCase = new GetFeatureFlagByName();

      try {
        const flag = await getFlagUseCase.execute("Mostrar Graficas Adicionales");
        setDisableAdditionalGraphs(!(flag?.is_enabled));
      } catch (error) {
        console.error("Error al obtener el flag Mostrar Graficas Adicionales", error);
        setDisableAdditionalGraphs(true);
      }
    };

    fetchTeacherFlags();
  }, [role]);

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
    const fetchStudentSubmission = async () => {
      if (!isStudent(role)) {
        return;
      }

      if (!assignmentid || !userid || userid === -1 || assignmentid < 0 || userid < 0) {
        setStudentSubmissionState("error");
        return;
      }

      setStudentSubmissionState("loading");
      setStudentSubmission(null);
      setSubmission(null);

      try {
        const submissionRepository = new SubmissionRepository();
        const submissionData = new GetSubmissionByUserandAssignmentId(submissionRepository);
        const fetchedSubmission =
          await submissionData.getSubmisssionByUserandSubmissionId(assignmentid, userid);

        if (fetchedSubmission === null) {
          setStudentSubmissionState("empty");
          return;
        }

        setSubmission(fetchedSubmission);
        setStudentSubmission(fetchedSubmission);
        setStudentSubmissionState("success");
      } catch (error) {
        console.error("Error verifying submission status:", error);
        setStudentSubmissionState("error");
      }
    };

    fetchStudentSubmission();
  }, [assignmentid, userid, role, refreshTick]);

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
  }, [assignmentid, role, refreshTick]);

  const openLinkDialog = () => {
    setLinkDialogOpen(true);
  };

  const refreshDetailData = () => {
    setRefreshTick((prev) => prev + 1);
  };

  const closeLinkDialog = () => {
    setLinkDialogOpen(false);
    setSubmissionErrorMessage(null);
  };

  const openCommentDialog = () => {
    setIsCommentDialogOpen(true);
  };

  const closeCommentDialog = () => {
    setIsCommentDialogOpen(false);
    setSubmissionErrorMessage(null);
  };

  const beginSubmissionMutation = () => {
    if (submissionMutationInProgress.current) {
      return false;
    }

    submissionMutationInProgress.current = true;
    setIsSubmissionMutationPending(true);
    setSubmissionErrorMessage(null);
    return true;
  };

  const endSubmissionMutation = () => {
    submissionMutationInProgress.current = false;
    setIsSubmissionMutationPending(false);
  };

  const sendGithubLink = async (repositoryLink: string): Promise<boolean> => {
    if (!assignmentid || !beginSubmissionMutation()) {
      return false;
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

    try {
      await createSubmission.createSubmission(submissionData);
      closeLinkDialog();
      refreshDetailData();
      return true;
    } catch (error) {
      console.error("Error starting submission:", error);
      setSubmissionErrorMessage("No se pudo iniciar la tarea. Intenta nuevamente.");
      return false;
    } finally {
      endSubmissionMutation();
    }
  };

  const sendComment = async (comment: string): Promise<boolean> => {
    if (!submission || !beginSubmissionMutation()) {
      return false;
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
      id: submission.id,
      status: "delivered",
      end_date,
      comment,
    };

    try {
      await finishSubmission.finishSubmission(submission.id, submissionData);
      closeCommentDialog();
      refreshDetailData();
      return true;
    } catch (error) {
      console.error("Error finishing submission:", error);
      setSubmissionErrorMessage("No se pudo finalizar la tarea. Intenta nuevamente.");
      return false;
    } finally {
      endSubmissionMutation();
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

  const openTeacherAdditionalGraphs = (row: SubmissionRowView) => {
    redirectAdmin(row.repositoryLink, row.id, "/aditionalgraph", "Complejidad");
  };

  return {
    assignment,
    groupDetails,
    assignmentState,
    deliveriesState,
    deliveriesRows,
    studentSubmission,
    studentSubmissionState,
    linkDialogOpen,
    isCommentDialogOpen,
    isSubmissionMutationPending,
    showIAButton,
    disableAdditionalGraphs,
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
    openTeacherAdditionalGraphs,
    studentRepositoryLink: studentSubmission?.repository_link,
    submissionRepositoryLink: submission?.repository_link,
    submissionErrorMessage,
    uiMessage,
    closeUiMessage: () => setUiMessage(null),
  };
}
