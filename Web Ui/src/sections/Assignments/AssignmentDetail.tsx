import React, { useEffect, useState } from "react";
import { GetAssignmentDetail } from "../../modules/Assignments/application/GetAssignmentDetail";
import { GetGroupDetail } from "../../modules/Groups/application/GetGroupDetail";
import { formatDate } from "../../utils/dateUtils";
import { AssignmentDataObject } from "../../modules/Assignments/domain/assignmentInterfaces";
import { GroupDataObject } from "../../modules/Groups/domain/GroupInterface";
import { useParams, createSearchParams, useNavigate } from "react-router-dom";
import AssignmentsRepository from "../../modules/Assignments/repository/AssignmentsRepository";
import GroupsRepository from "../../modules/Groups/repository/GroupsRepository";
import { GetFeatureFlagByName } from "../../modules/FeatureFlags/application/GetFeatureFlagByName";

import {
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import {
  AccessTime as AccessTimeIcon,
  Link as LinkIcon,
  Comment as CommentIcon,
} from "@mui/icons-material";
import { GitLinkDialog } from "./components/GitHubLinkDialog";
import { CommentDialog } from "./components/CommentDialog";
import CircularProgress from "@mui/material/CircularProgress";
import SubmissionRepository from "../../modules/Submissions/Repository/SubmissionRepository";
import { CreateSubmission } from "../../modules/Submissions/Aplication/createSubmission";
import {
  SubmissionCreationObject,
  SubmissionDataObject,
  SubmissionUpdateObject,
} from "../../modules/Submissions/Domain/submissionInterfaces";
import { GetSubmissionsByAssignmentId } from "../../modules/Submissions/Aplication/getSubmissionsByAssignmentId";
import UsersRepository from "../../modules/Users/repository/UsersRepository";
import { FinishSubmission } from "../../modules/Submissions/Aplication/finishSubmission";
import { GetSubmissionByUserandAssignmentId } from "../../modules/Submissions/Aplication/getSubmissionByUseridandSubmissionid";

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
  const [assignment, setAssignment] = useState<AssignmentDataObject | null>(
    null
  );
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const { id } = useParams();
  const assignmentid = Number(id);
  const [groupDetails, setGroupDetails] = useState<GroupDataObject | null>(
    null
  );
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [submissions, setSubmissions] = useState<SubmissionDataObject[]>([]);
  const [studentSubmission, setStudentSubmission] = useState<SubmissionDataObject>();
  const [_submissionsError, setSubmissionsError] = useState<string | null>(null);
  const [studentRows, setStudentRows] = useState<JSX.Element[]>([]);
  const [submission, setSubmission] = useState<SubmissionDataObject | null>(null);
  const [showIAButton, setShowIAButton] = useState(false);
  const [disableAdditionalGraphs, setDisableAdditionalGraphs] = useState(true);


  useEffect(() => {
    const fetchFlag = async () => {
      if (!isStudent(role)) {
        const getFlagUseCase = new GetFeatureFlagByName();
        try {
          const flag = await getFlagUseCase.execute("Mostrar Graficas Adicionales");
          setDisableAdditionalGraphs(!(flag?.is_enabled));
        } catch (error) {
          console.error("Error al obtener el flag Mostrar Graficas Adicionales", error);
          setDisableAdditionalGraphs(true); // por precaución
        }
      }
    };

    fetchFlag();
  }, [role]);

  useEffect(() => {
    if (!isStudent(role)) return;

    const getFlagUseCase = new GetFeatureFlagByName();

    const fetchFeatureFlag = async () => {
      try {
        const flag = await getFlagUseCase.execute("Boton Asistente IA");
        setShowIAButton(flag?.is_enabled ?? true);
      } catch (error) {
        console.error("Error fetching feature flag IA_ASSISTANT:", error);
      }
    };

    fetchFeatureFlag();
  }, [role]);


  const navigate = useNavigate();
  const usersRepository = new UsersRepository();


  useEffect(() => {
    const fetchSubmission = async () => {
      if (assignmentid && userid && userid !== -1) {
        try {
          const submissionRepository = new SubmissionRepository();
          const submissionData = new GetSubmissionByUserandAssignmentId(submissionRepository);

          if (assignmentid < 0 || userid < 0) {
            return; // Validación silenciosa
          }

          const fetchedSubmission = await submissionData.getSubmisssionByUserandSubmissionId(assignmentid, userid);
          setSubmission(fetchedSubmission);
        } catch (error) {
          console.error("Error verifying submission status:", error);
        }
      }
    };

    fetchSubmission();
  }, [assignmentid, userid]);

  useEffect(() => {
    const assignmentsRepository = new AssignmentsRepository();
    const getAssignmentDetail = new GetAssignmentDetail(assignmentsRepository);

    getAssignmentDetail
      .obtainAssignmentDetail(assignmentid)
      .then((fetchedAssignment) => {
        setAssignment(fetchedAssignment);
      })
      .catch((error) => {
        console.error("Error fetching assignment:", error);
      });
  }, [assignmentid]);
  useEffect(() => {
    const groupsRepository = new GroupsRepository();
    const getGroupDetail = new GetGroupDetail(groupsRepository);

    if (assignment?.groupid) {
      getGroupDetail
        .obtainGroupDetail(assignment.groupid)
        .then((fetchedGroupDetails) => {
          setGroupDetails(fetchedGroupDetails);
        })
        .catch((error) => {
          console.error("Error fetching group details:", error);
        });
    }
  }, [assignment]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!isStudent(role)) {
        setLoadingSubmissions(true);
        setSubmissionsError(null);
        try {
          const submissionRepository = new SubmissionRepository();
          const getSubmissionsByAssignmentId = new GetSubmissionsByAssignmentId(
            submissionRepository
          );
          const fetchedSubmissions =
            await getSubmissionsByAssignmentId.getSubmissionsByAssignmentId(
              assignmentid
            );
          setSubmissions(fetchedSubmissions);
        } catch (error) {
          setSubmissionsError(
            "Error fetching submissions. Please try again later."
          );
          console.error("Error fetching SubmissionByAssignmentAndUser:", error);
        } finally {
          setLoadingSubmissions(false);
        }
      }
    };

    fetchSubmissions();
  }, [assignmentid, role]);

  useEffect(() => {
    renderStudentRows();
  }, [submissions]);

  const isTaskInProgress = submission?.status !== "in progress";
  useEffect(() => {
    const fetchStudentSubmission = async () => {
      if (isStudent(role)) {
        if (assignmentid && userid && userid !== -1) {
          try {
            const submissionRepository = new SubmissionRepository();
            const getSubmissionsByAssignmentId = new GetSubmissionsByAssignmentId(submissionRepository);
            const allSubmissions = await getSubmissionsByAssignmentId.getSubmissionsByAssignmentId(assignmentid);
            const userSubmission = allSubmissions.find(submission => submission.userid === userid);
            if (userSubmission) {
              setStudentSubmission(userSubmission);
            }
          } catch (error) {
            console.error("Error fetching student submission:", error);
            setSubmissionsError("An error occurred while fetching the student submission.");
          }
        }
      }
    };

    fetchStudentSubmission();
  }, [assignmentid, userid, role]);

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

        return (
          <TableRow key={generateUniqueId()}>
            <TableCell>{studentEmail}</TableCell>
            <TableCell>{getDisplayStatus(submission.status)}</TableCell>
            <TableCell>
              <a
                href={submission.repository_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {submission.repository_link}
              </a>
            </TableCell>
            <TableCell>{formattedStartDate}</TableCell>
            <TableCell>{formattedEndDate}</TableCell>
            <TableCell>{submission.comment || "N/A"}</TableCell>
            <TableCell>
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
                  fontSize: "15px",
                  marginRight: "8px",
                }}
              >
                Ver gráfica
              </Button>
            </TableCell>

            <TableCell>

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
                  fontSize: "15px",
                  marginRight: "8px",
                }}
              >
                Asistente IA
              </Button>

            </TableCell>
            {!isStudent(role) && (
              <TableCell>
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
                    fontSize: "15px",
                    marginRight: "7px",
                  }}
                >
                  Ver gráficas adicionales
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
        gap: '10px',
      }}
    >
      {assignment ? (
        <Card variant="elevation" elevation={0}>
          <CardContent>
            <div style={{ marginBottom: "40px" }}>
              <Typography
                variant="h5"
                component="div"
                style={{ fontSize: "30px", lineHeight: "3.8" }}
              >
                {assignment.title}
              </Typography>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <ArchiveOutlinedIcon
                  style={{ marginRight: "8px", color: "#666666" }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  style={{ fontSize: "16px", lineHeight: "1.8" }}
                >
                  <strong>Grupo:</strong> {groupDetails?.groupName}
                </Typography>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <NotesOutlinedIcon
                  style={{ marginRight: "8px", color: "#666666" }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  style={{ fontSize: "16px", lineHeight: "1.8" }}
                >
                  <strong>Instrucciones:</strong> {assignment.description}
                </Typography>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <CalendarMonthIcon
                  style={{ marginRight: "8px", color: "#666666" }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  style={{ fontSize: "16px", lineHeight: "1.8" }}
                >
                  <strong>Inicio:</strong>{" "}
                  {formatDate(assignment.start_date.toString())}
                </Typography>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <CalendarMonthIcon
                  style={{ marginRight: "8px", color: "#666666" }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  style={{ fontSize: "16px", lineHeight: "1.8" }}
                >
                  <strong>Fecha límite:</strong>{" "}
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
        <Card variant="elevation" elevation={0}>
          <CardContent>
            <Typography
              variant="h6"
              component="div"
              align="center"
              style={{ fontSize: "24px", lineHeight: "3.8" }}
            >
              Lista de Estudiantes
            </Typography>
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
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Enlace</TableCell>
                    <TableCell>Fecha de inicio</TableCell>
                    <TableCell>Fecha de finalización</TableCell>
                    <TableCell>Comentario</TableCell>
                    <TableCell>Gráfica</TableCell>
                    <TableCell>Asistente</TableCell>
                    <TableCell>Gráficas Adicionales</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {studentRows}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AssignmentDetail;