import React, { useEffect, useState } from "react";
import { formatDate } from "../../utils/dateUtils";
import { useParams, createSearchParams, useNavigate } from "react-router-dom";

import {
  Button,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import GroupsIcon from "@mui/icons-material/Groups";
import {
  AccessTime as AccessTimeIcon,
  Link as LinkIcon,
  RemoveCircle as RemoveCircleIcon,
  Comment as CommentIcon,
} from "@mui/icons-material";
import { GitLinkDialog } from "./components/GitHubLinkDialog";
import { CommentDialog } from "./components/CommentDialog";
import CircularProgress from "@mui/material/CircularProgress";
import SubmissionRepository from "../../modules/Submissions/Repository/SubmissionRepository";
import { CreateSubmission } from "../../modules/Submissions/Aplication/createSubmission";
import {
  SubmissionCreationObject,
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
  handleRedirectStudent,
} from '../Shared/handlers.ts';


interface AssignmentDetailProps {
  role: string;
  userid: number;
}

function isStudent(role: string) {
  return role === "student";
}

function generateUniqueId() {
  const timestamp = Date.now().toString(36);
  const randomChars = Math.random().toString(36).substring(2, 8);
  return timestamp + randomChars;
}

const AssignmentDetail: React.FC<AssignmentDetailProps> = ({
  role,
  userid,
}) => {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const { id } = useParams();
  const assignmentid = Number(id);
  const [studentRows, setStudentRows] = useState<JSX.Element[]>([]);
  const navigate = useNavigate();
  const usersRepository = new UsersRepository();
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
  useEffect(() => {
    renderStudentRows();
  }, [submissions]);

  const isTaskInProgress = submission?.status !== "in progress";

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

  const handleRedirectAdmin = (link: string, fetchedSubmissions: any[], submissionId: number, url: string) => {
    if (link) {
      const regex = /https:\/\/github\.com\/([^/]+)\/([^/]+)/;
      const match = regex.exec(link);

      if (match) {
        const [, user, repo] = match;
        navigate({
          pathname: url,
          search: createSearchParams({
            repoOwner: user,
            repoName: repo,
            fetchedSubmissions: JSON.stringify(fetchedSubmissions),
            submissionId: submissionId.toString(),  // Convertimos submissionId a cadena para pasarlo como parámetro
          }).toString(),
        });
      } else {
        alert("Link Invalido, por favor ingrese un link valido.");
      }
    } else {
      alert("No se encontro un link para esta tarea.");
    }
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

  const getStudentEmailById = async (studentId: number): Promise<string> => {
    try {
      const student = await usersRepository.getUserById(studentId);
      return student.email;
    } catch (error) {
      console.error("Error fetching student email:", error);
      return "";
    }
  };
  const renderStudentRows = async () => {

    const rows = await Promise.all(
      submissions.map(async (submission) => {
        const studentEmail = await getStudentEmailById(submission.userid);
        const formattedStartDate = formatDate(submission.start_date.toString());
        const formattedEndDate = submission.end_date
          ? formatDate(submission.end_date.toString())
          : "N/A";
        const hasRepositoryLink = submission.repository_link !== "";
        const teacherStatus = hasRepositoryLink ? "Enviado" : "No enviado";
        const statusColor = hasRepositoryLink ? "#4CAF50" : "#F44336";

        return (
          <TableRow key={generateUniqueId()} sx={{ borderBottom: "1px solid #C9C9C9" }}>
            <TableCell
              sx={{
                py: 2.2,
                fontSize: "1.3rem",
                maxWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={studentEmail}
            >
              {studentEmail}
            </TableCell>
            <TableCell
              sx={{
                py: 2.2,
                fontSize: "1.3rem",
                color: statusColor,
                borderLeft: "1px solid #C9C9C9",
                whiteSpace: "nowrap",
              }}
            >
              {teacherStatus}
            </TableCell>
            <TableCell sx={{ py: 2.2, borderLeft: "1px solid #C9C9C9", textAlign: "center" }}>
              {hasRepositoryLink ? (
                <a
                  href={submission.repository_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", color: "#5C6BC0" }}
                >
                  <LinkIcon />
                </a>
              ) : (
                <RemoveCircleIcon sx={{ color: "#F44336" }} />
              )}
            </TableCell>
            <TableCell sx={{ py: 2.2, fontSize: "1.3rem", borderLeft: "1px solid #C9C9C9" }}>{formattedStartDate}</TableCell>
            <TableCell sx={{ py: 2.2, fontSize: "1.3rem", borderLeft: "1px solid #C9C9C9" }}>{formattedEndDate}</TableCell>
            <TableCell sx={{ py: 2.2, borderLeft: "1px solid #C9C9C9" }}>
              <Button
                variant="contained"
                disabled={submission.repository_link === ""}
                onClick={() => {
                  localStorage.setItem("selectedMetric", "Dashboard");
                  handleRedirectAdmin(submission.repository_link, submissions, submission.id, "/graph")
                }}
                color="primary"
                style={{
                  textTransform: "none",
                  fontSize: "1.15rem",
                  marginRight: "8px",
                  backgroundColor: submission.repository_link === "" ? "#BDBDBD" : undefined,
                  minWidth: "110px",
                }}
              >
                Ver grafica
              </Button>
            </TableCell>

            <TableCell sx={{ py: 2.2, borderLeft: "1px solid #C9C9C9" }}>

              <Button
                variant="contained"
                disabled={submission.repository_link === ""}
                onClick={() => {
                  navigate("/asistente-ia", {
                    state: { repositoryLink: submission.repository_link }, // Pasar el enlace correctamente
                  });
                }}
                color="primary"
                style={{
                  textTransform: "none",
                  fontSize: "1.15rem",
                  marginRight: "8px",
                  backgroundColor: submission.repository_link === "" ? "#BDBDBD" : undefined,
                  minWidth: "110px",
                }}
              >
                Asistente
              </Button>

            </TableCell>
            {!isStudent(role) && (
              <TableCell sx={{ py: 2.2, borderLeft: "1px solid #C9C9C9" }}>
                <Button
                  variant="contained"
                  disabled={submission.repository_link === "" || disableAdditionalGraphs}
                  onClick={() => {
                    localStorage.setItem("selectedMetric", "Complejidad");
                    handleRedirectAdmin(submission.repository_link, submissions, submission.id, "/aditionalgraph")
                  }}
                  color="primary"
                  style={{
                    textTransform: "none",
                    fontSize: "1.15rem",
                    marginRight: "7px",
                    backgroundColor: submission.repository_link === "" || disableAdditionalGraphs ? "#BDBDBD" : undefined,
                    minWidth: "84px",
                  }}
                >
                  Ver
                </Button>
              </TableCell>
            )}
          </TableRow>
        );
      })
    );

    setStudentRows(rows);
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "14px",
                }}
              >
                <GroupsIcon
                  style={{ marginRight: "10px", color: "#7A7A7A", fontSize: "28px" }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  style={{ fontSize: "26px", lineHeight: 1.45 }}
                >
                  <strong>Grupo:</strong> {groupDetails?.groupName}
                </Typography>
              </div>
              {isStudent(role) && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "14px",
                  }}
                >
                  <NotesOutlinedIcon
                    style={{ marginRight: "10px", color: "#7A7A7A", fontSize: "28px" }}
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    style={{ fontSize: "26px", lineHeight: 1.45 }}
                  >
                    <strong>Instrucciones:</strong> {assignment.description}
                  </Typography>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "14px",
                }}
              >
                <CalendarMonthIcon
                  style={{ marginRight: "10px", color: "#7A7A7A", fontSize: "28px" }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  style={{ fontSize: "26px", lineHeight: 1.45 }}
                >
                  <strong>Inicio:</strong>{" "}
                  {formatDate(assignment.start_date.toString())}
                </Typography>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "14px",
                }}
              >
                <CalendarMonthIcon
                  style={{ marginRight: "10px", color: "#7A7A7A", fontSize: "28px" }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  style={{ fontSize: "26px", lineHeight: 1.45 }}
                >
                  <strong>Finalización:</strong>{" "}
                  {formatDate(assignment.end_date.toString())}
                </Typography>
              </div>
              {isStudent(role) && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <AccessTimeIcon
                    style={{ marginRight: "8px", color: "#666666" }}
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    style={{ fontSize: "16px", lineHeight: "1.8" }}
                  >
                    <strong>Estado:</strong>{" "}
                    {getDisplayStatus(studentSubmission?.status)}
                  </Typography>
                </div>
              )}

              {isStudent(role) && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <LinkIcon style={{ marginRight: "8px", color: "#666666" }} />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    style={{ fontSize: "16px", lineHeight: "1.8" }}
                  >
                    <strong>Enlace:</strong>
                    <a
                      href={studentSubmission?.repository_link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {studentSubmission?.repository_link}
                    </a>
                  </Typography>
                </div>
              )}

              {isStudent(role) &&
                (assignment.comment ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <CommentIcon
                      style={{ marginRight: "8px", color: "#666666" }}
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      style={{ fontSize: "16px", lineHeight: "1.8" }}
                    >
                      <strong>Comentario:</strong> {studentSubmission?.repository_link === "" || studentSubmission == null}
                    </Typography>
                  </div>
                ) : null)}
            </div>
            {isStudent(role) && (
              <Button
                variant="contained"
                disabled={!!studentSubmission}
                onClick={handleOpenLinkDialog}
                style={{
                  textTransform: "none",
                  fontSize: "15px",
                  marginRight: "8px",
                }}
              >
                Iniciar tarea
              </Button>
            )}

            {isStudent(role) && (
              <Button
                variant="contained"
                disabled={studentSubmission?.repository_link === "" || studentSubmission == null}
                onClick={() => {
                  localStorage.setItem("selectedMetric", "Dashboard");
                  if (studentSubmission?.repository_link) {
                    handleRedirectStudent(studentSubmission.repository_link, studentSubmission.id, navigate)
                  }
                }}
                color="primary"
                style={{
                  textTransform: "none",
                  fontSize: "15px",
                  marginRight: "8px",
                }}
              >
                Ver gráfica
              </Button>
            )}
            <GitLinkDialog
              open={linkDialogOpen}
              onClose={handleCloseLinkDialog}
              onSend={handleSendGithubLink}
            />

            {isStudent(role) && (
              <Button
                variant="contained"
                disabled={isTaskInProgress}
                onClick={handleOpenCommentDialog}
                style={{
                  textTransform: "none",
                  fontSize: "15px",
                  marginRight: "8px",
                }}
              >
                Finalizar tarea
              </Button>
            )}
            {isStudent(role) && showIAButton && (
              <Button
                variant="contained"
                disabled={studentSubmission?.repository_link === "" || studentSubmission == null}
                onClick={() => {
                  localStorage.setItem("selectedMetric", "AssistantAI");
                  navigate("/asistente-ia", {
                    state: { repositoryLink: studentSubmission?.repository_link }
                  });
                }}
                color="primary"
                style={{
                  textTransform: "none",
                  fontSize: "15px",
                  marginRight: "8px",
                }}
              >
                Asistente IA
              </Button>
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
              <Table sx={{ borderCollapse: "collapse", tableLayout: "fixed" }}>
                <TableHead>
                  <TableRow sx={{ borderBottom: "1px solid #C9C9C9" }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: "1.65rem", py: 1.3, width: "18%" }}>Correo</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "1.65rem", py: 1.3, width: "11%", borderLeft: "1px solid #C9C9C9" }}>Estado</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "1.65rem", py: 1.3, width: "10%", borderLeft: "1px solid #C9C9C9" }}>Enlace</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "1.65rem", py: 1.3, width: "13%", borderLeft: "1px solid #C9C9C9" }}>Fecha de Inicio</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "1.65rem", py: 1.3, width: "14%", borderLeft: "1px solid #C9C9C9" }}>Fecha de Finalización</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "1.65rem", py: 1.3, width: "13%", borderLeft: "1px solid #C9C9C9" }}>Grafica</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "1.65rem", py: 1.3, width: "12%", borderLeft: "1px solid #C9C9C9" }}>Asistente AI</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "1.65rem", py: 1.3, width: "12%", borderLeft: "1px solid #C9C9C9" }}>Graficas Adicionales</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {studentRows}
                </TableBody>
              </Table>
            )}
        </div>
      )}
    </div>
  );
};

export default AssignmentDetail;