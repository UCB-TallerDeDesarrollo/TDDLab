import React, { useEffect, useMemo, useState } from "react";
import { formatDate } from "../../utils/dateUtils";
import { useParams, useNavigate } from "react-router-dom";

import { Card, CardContent, Divider, Typography } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import GroupsIcon from "@mui/icons-material/Groups";
import {
  AccessTime as AccessTimeIcon,
  Link as LinkIcon,
  Comment as CommentIcon,
} from "@mui/icons-material";
import { GitLinkDialog } from "./components/GitHubLinkDialog";
import { CommentDialog } from "./components/CommentDialog";
import CircularProgress from "@mui/material/CircularProgress";
import { ActionButton } from "../Shared/Components/ActionButton";
import { InfoRow } from "../Shared/Components/InfoRow";
import { SubmissionTable } from "./components/SubmissionTable";
import SubmissionRepository from "../../modules/Submissions/Repository/SubmissionRepository";
import { CreateSubmission } from "../../modules/Submissions/Aplication/createSubmission";
import {
  SubmissionCreationObject,
  SubmissionDataObject,
  SubmissionUpdateObject,
} from "../../modules/Submissions/Domain/submissionInterfaces";
import UsersRepository from "../../modules/Users/repository/UsersRepository";
import { FinishSubmission } from "../../modules/Submissions/Aplication/finishSubmission";
import {
  useAssignmentDetail,
  useAssignmentSubmissions,
  useFeatureFlagEnabled,
  useGroupDetail,
  useStudentSubmission,
  useSubmissionByUserAndAssignment,
} from "./hooks/useAssignmentDetailData";

import {
  handleRedirectAdmin,
  handleRedirectStudent,
} from '../Shared/handlers.ts';


interface AssignmentDetailProps {
  role: string;
  userid: number;
}

function isStudent(role: string) {
  return role === "student";
}

const AssignmentDetail: React.FC<AssignmentDetailProps> = ({
  role,
  userid,
}) => {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const { id } = useParams();
  const assignmentid = Number(id);
  const [studentEmails, setStudentEmails] = useState<Record<number, string>>({});
  const navigate = useNavigate();
  const usersRepository = useMemo(() => new UsersRepository(), []);
  const assignment = useAssignmentDetail(assignmentid);
  const groupDetails = useGroupDetail(assignment?.groupid);
  const { submissions, loading: loadingSubmissions } = useAssignmentSubmissions(
    assignmentid,
    !isStudent(role)
  );
  const { studentSubmission } = useStudentSubmission(
    assignmentid,
    userid,
    isStudent(role)
  );
  const submission = useSubmissionByUserAndAssignment(assignmentid, userid);
  const additionalGraphsEnabled = useFeatureFlagEnabled(
    "Mostrar Graficas Adicionales",
    { enabled: !isStudent(role), defaultValue: false }
  );
  const showIAButton = useFeatureFlagEnabled("Boton Asistente IA", {
    enabled: isStudent(role),
    defaultValue: false,
    fallbackValue: true,
  });
  const disableAdditionalGraphs = !additionalGraphsEnabled;
  const isTaskInProgress = submission?.status !== "in progress";
  const missingUserIds = useMemo(() => {
    const uniqueIds = new Set(submissions.map((item) => item.userid));
    return Array.from(uniqueIds).filter(
      (studentId) => studentEmails[studentId] === undefined
    );
  }, [studentEmails, submissions]);

  useEffect(() => {
    const loadStudentEmails = async () => {
      if (missingUserIds.length === 0) {
        return;
      }

      try {
        const entries = await Promise.all(
          missingUserIds.map(async (studentId) => {
            const student = await usersRepository.getUserById(studentId);
            return [studentId, student.email] as const;
          })
        );

        setStudentEmails((prev) => {
          const next = { ...prev };
          entries.forEach(([studentId, email]) => {
            next[studentId] = email;
          });
          return next;
        });
      } catch (error) {
        console.error("Error fetching student emails:", error);
      }
    };

    loadStudentEmails();
  }, [missingUserIds, usersRepository]);

  const handleSendGithubLink = async (repository_link: string) => {
    if (assignmentid) { //means if the assignment id is in memory or somthn
      const submissionsRepository = new SubmissionRepository();
      const createSubmission = new CreateSubmission(submissionsRepository);
      const startDate = new Date();
      const start_date = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate()
      );
      const submissionData: SubmissionCreationObject = {
        assignmentid: assignmentid,
        userid: userid,
        status: "in progress",
        repository_link: repository_link,
        start_date: start_date,
      };
      try {
        await createSubmission.createSubmission(submissionData);
        handleCloseLinkDialog();
      } catch (error) {

        throw error;
      }
    }
  };

  const handleOpenLinkDialog = () => {
    setLinkDialogOpen(true);
  };

  const handleCloseLinkDialog = () => {
    setLinkDialogOpen(false);
    window.location.reload();
  };

  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);

  const [_comment, setComment] = useState("");

  const handleOpenCommentDialog = () => {
    setIsCommentDialogOpen(true);
  };

  const handleCloseCommentDialog = () => {
    setIsCommentDialogOpen(false);
  };

  const handleSendComment = async (comment: string) => {
    if (submission) {
      setComment(comment);
      const submissionRepository = new SubmissionRepository();
      const finishSubmission = new FinishSubmission(submissionRepository);
      const endDate = new Date();
      const end_date = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate()
      );
      const submissionData: SubmissionUpdateObject = {
        id: submission?.id,
        status: "delivered",
        end_date: end_date,
        comment: comment
      };
      try {
        await finishSubmission.finishSubmission(submission.id, submissionData);
        handleCloseLinkDialog();
      } catch (error) {

        throw error;
      }
    }
    handleCloseCommentDialog();
    window.location.reload();
  };

  const getDisplayStatus = (status: string | undefined) => {
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
  };
  const handleViewGraph = (targetSubmission: SubmissionDataObject) => {
    localStorage.setItem("selectedMetric", "Dashboard");
    handleRedirectAdmin(
      targetSubmission.repository_link,
      submissions,
      targetSubmission.id,
      "/graph",
      navigate
    );
  };

  const handleOpenAssistant = (targetSubmission: SubmissionDataObject) => {
    navigate("/asistente-ia", {
      state: { repositoryLink: targetSubmission.repository_link },
    });
  };

  const handleViewAdditionalGraph = (targetSubmission: SubmissionDataObject) => {
    localStorage.setItem("selectedMetric", "Complejidad");
    handleRedirectAdmin(
      targetSubmission.repository_link,
      submissions,
      targetSubmission.id,
      "/aditionalgraph",
      navigate
    );
  };


  return (

    <div
      style={{
        display: "flex",
        flexDirection: 'column',
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        gap: '24px',
        padding: "20px 0",
      }}
    >
      {assignment ? (
        <Card
          variant="elevation"
          elevation={0}
          style={{
            width: "100%",
            maxWidth: "520px",
            border: "1px solid #BFBFBF",
            borderRadius: "6px",
          }}
        >
          <CardContent style={{ padding: "20px 34px 18px" }}>
            <div style={{ marginBottom: "20px" }}>
              <Typography
                variant="h5"
                component="div"
                align="center"
                style={{ fontSize: "46px", fontWeight: 700, lineHeight: 1.1, marginBottom: "20px" }}
              >
                {assignment.title}
              </Typography>
              <InfoRow
                icon={<GroupsIcon sx={{ color: "#7A7A7A", fontSize: 28 }} />}
                label="Grupo"
                value={groupDetails?.groupName}
                textSx={{ fontSize: "26px", lineHeight: 1.45 }}
              />
              {isStudent(role) && (
                <InfoRow
                  icon={<NotesOutlinedIcon sx={{ color: "#7A7A7A", fontSize: 28 }} />}
                  label="Instrucciones"
                  value={assignment.description}
                  textSx={{ fontSize: "26px", lineHeight: 1.45 }}
                />
              )}
              <InfoRow
                icon={<CalendarMonthIcon sx={{ color: "#7A7A7A", fontSize: 28 }} />}
                label="Inicio"
                value={formatDate(assignment.start_date.toString())}
                textSx={{ fontSize: "26px", lineHeight: 1.45 }}
              />
              <InfoRow
                icon={<CalendarMonthIcon sx={{ color: "#7A7A7A", fontSize: 28 }} />}
                label="Finalización"
                value={formatDate(assignment.end_date.toString())}
                textSx={{ fontSize: "26px", lineHeight: 1.45 }}
              />
              {isStudent(role) && (
                <InfoRow
                  icon={<AccessTimeIcon sx={{ color: "#666666" }} />}
                  label="Estado"
                  value={getDisplayStatus(studentSubmission?.status)}
                  containerSx={{ mb: 1 }}
                  textSx={{ fontSize: "16px", lineHeight: "1.8" }}
                />
              )}

              {isStudent(role) && (
                <InfoRow
                  icon={<LinkIcon sx={{ color: "#666666" }} />}
                  label="Enlace"
                  value={
                    <a
                      href={studentSubmission?.repository_link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {studentSubmission?.repository_link}
                    </a>
                  }
                  containerSx={{ mb: 1 }}
                  textSx={{ fontSize: "16px", lineHeight: "1.8" }}
                />
              )}

              {isStudent(role) &&
                (assignment.comment ? (
                  <InfoRow
                    icon={<CommentIcon sx={{ color: "#666666" }} />}
                    label="Comentario"
                    value={
                      studentSubmission?.repository_link === "" ||
                      studentSubmission == null
                    }
                    containerSx={{ mb: 1 }}
                    textSx={{ fontSize: "16px", lineHeight: "1.8" }}
                  />
                ) : null)}
            </div>
            {isStudent(role) && (
              <ActionButton
                variant="contained"
                disabled={!!studentSubmission}
                onClick={handleOpenLinkDialog}
              >
                Iniciar tarea
              </ActionButton>
            )}

            {isStudent(role) && (
              <ActionButton
                variant="contained"
                disabled={studentSubmission?.repository_link === "" || studentSubmission == null}
                onClick={() => {
                  localStorage.setItem("selectedMetric", "Dashboard");
                  if (studentSubmission?.repository_link) {
                    handleRedirectStudent(studentSubmission.repository_link, studentSubmission.id, navigate)
                  }
                }}
                color="primary"
              >
                Ver gráfica
              </ActionButton>
            )}
            <GitLinkDialog
              open={linkDialogOpen}
              onClose={handleCloseLinkDialog}
              onSend={handleSendGithubLink}
            />

            {isStudent(role) && (
              <ActionButton
                variant="contained"
                disabled={isTaskInProgress}
                onClick={handleOpenCommentDialog}
              >
                Finalizar tarea
              </ActionButton>
            )}
            {isStudent(role) && showIAButton && (
              <ActionButton
                variant="contained"
                disabled={studentSubmission?.repository_link === "" || studentSubmission == null}
                onClick={() => {
                  localStorage.setItem("selectedMetric", "AssistantAI");
                  navigate("/asistente-ia", {
                    state: { repositoryLink: studentSubmission?.repository_link }
                  });
                }}
                color="primary"
              >
                Asistente IA
              </ActionButton>
            )}
            <CommentDialog
              open={isCommentDialogOpen}
              link={submission?.repository_link}
              onSend={handleSendComment}
              onClose={handleCloseCommentDialog}
            />
          </CardContent>
        </Card>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "250px",
          }}
        >
          <CircularProgress size={60} thickness={5} data-testid="loading-indicator" />
        </div>
      )}
      {!isStudent(role) && (
        <div style={{ width: "96%", maxWidth: "1260px" }}>
          <Typography
            variant="h6"
            component="div"
            style={{ fontSize: "38px", fontWeight: 700, marginBottom: "8px" }}
          >
            Lista de entregas
          </Typography>
          <Divider sx={{ borderBottomWidth: 3, borderColor: "#7F7F7F", mb: 3 }} />
            {loadingSubmissions ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "150px",
                }}
              >
                <CircularProgress size={40} thickness={4} />
              </div>
            ) : (
              <SubmissionTable
                submissions={submissions}
                studentEmails={studentEmails}
                disableAdditionalGraphs={disableAdditionalGraphs}
                showAdditionalGraphs={!isStudent(role)}
                onViewGraph={handleViewGraph}
                onOpenAssistant={handleOpenAssistant}
                onViewAdditionalGraph={handleViewAdditionalGraph}
              />
            )}
        </div>
      )}
    </div>
  );
};

export default AssignmentDetail;