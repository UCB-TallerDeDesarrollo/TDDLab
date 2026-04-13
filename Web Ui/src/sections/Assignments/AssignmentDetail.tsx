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
                className="btn-std btn-primary"
                disabled={submission.repository_link === ""}
                onClick={() => {
                  localStorage.setItem("selectedMetric", "Dashboard");
                  handleRedirectAdmin(submission.repository_link, submissions, submission.id, "/graph")
                }}
              >
                Ver gráfica
              </Button>
            </TableCell>

            <TableCell>
              <Button
                className="btn-std btn-primary"
                disabled={submission.repository_link === ""}
                onClick={() => {
                  navigate("/asistente-ia", {
                    state: { repositoryLink: submission.repository_link }, // Pasar el enlace correctamente
                  });
                }}
              >
                Asistente
              </Button>

            </TableCell>
            {!isStudent(role) && (
              <TableCell>
                <Button
                  className="btn-std btn-primary"
                  disabled={submission.repository_link === "" || disableAdditionalGraphs}
                  onClick={() => {
                    localStorage.setItem("selectedMetric", "Complejidad");
                    handleRedirectAdmin(submission.repository_link, submissions, submission.id, "/aditionalgraph")
                  }}
                >
                  Ver mas
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
    <div className="centered-container">
      {assignment ? (
        <Card variant="elevation" elevation={0} className="table-container-full">
          <CardContent>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
              {assignment.title}
            </Typography>

            <div className="assignment-details-list">
              {/* Grupo */}
              <div className="detail-item">
                <ArchiveOutlinedIcon className="detail-icon" />
                <Typography variant="body1">
                  <strong>Grupo:</strong> {groupDetails?.groupName}
                </Typography>
              </div>

              {/* Instrucciones */}
              <div className="detail-item">
                <NotesOutlinedIcon className="detail-icon" />
                <Typography variant="body1">
                  <strong>Instrucciones:</strong> {assignment.description}
                </Typography>
              </div>

              {/* Fechas */}
              <div className="detail-item">
                <CalendarMonthIcon className="detail-icon" />
                <Typography variant="body1">
                  <strong>Inicio:</strong> {formatDate(assignment.start_date.toString())}
                </Typography>
              </div>
              <div className="detail-item">
                <CalendarMonthIcon className="detail-icon" />
                <Typography variant="body1">
                  <strong>Fecha límite:</strong> {formatDate(assignment.end_date.toString())}
                </Typography>
              </div>

              {/* Secciones exclusivas de Estudiante (Importante para los tests) */}
              {isStudent(role) && (
                <>
                  <div className="detail-item">
                    <AccessTimeIcon className="detail-icon" />
                    <Typography variant="body1">
                      {/* Texto plano compatible con getByText("Estado") */}
                      <strong>Estado: </strong> {getDisplayStatus(studentSubmission?.status)}
                    </Typography>
                  </div>

                  <div className="detail-item">
                    <LinkIcon className="detail-icon" />
                    <Typography variant="body1">
                      <strong>Enlace:</strong>{" "}
                      <a href={studentSubmission?.repository_link} target="_blank" rel="noopener noreferrer">
                        {studentSubmission?.repository_link}
                      </a>
                    </Typography>
                  </div>
                </>
              )}
            </div>

            {/* Acciones de Estudiante */}
            {isStudent(role) && (
              <div className="action-buttons-group" style={{ justifyContent: 'flex-start', marginTop: '20px' }}>
                <Button
                  disabled={!!studentSubmission}
                  onClick={handleOpenLinkDialog}
                  className="btn-std btn-primary"
                >
                  Iniciar tarea
                </Button>

                <Button
                  disabled={!studentSubmission?.repository_link}
                  onClick={() => {
                    localStorage.setItem("selectedMetric", "Dashboard");
                    if (studentSubmission?.repository_link) {
                      handleRedirectStudent(studentSubmission.repository_link, studentSubmission.id, navigate)
                    }
                  }}
                  className="btn-std btn-primary"
                >
                  Ver gráfica
                </Button>

                <Button
                  disabled={isTaskInProgress}
                  onClick={handleOpenCommentDialog}
                  className="btn-std btn-primary"
                >
                  Finalizar tarea
                </Button>

                {showIAButton && (
                  <Button
                    disabled={!studentSubmission?.repository_link}
                    onClick={() => {
                      localStorage.setItem("selectedMetric", "AssistantAI");
                      navigate("/asistente-ia", {
                        state: { repositoryLink: studentSubmission?.repository_link }
                      });
                    }}
                    className="btn-std btn-primary"
                  >
                    Asistente IA
                  </Button>
                )}
              </div>
            )}
            
            <GitLinkDialog open={linkDialogOpen} onClose={handleCloseLinkDialog} onSend={handleSendGithubLink} />
            <CommentDialog open={isCommentDialogOpen} link={submission?.repository_link} onSend={handleSendComment} onClose={handleCloseCommentDialog} />
          </CardContent>
        </Card>
      ) : (
        <div className="fullscreen-loading">
          {/* data-testid crucial para los tests */}
          <CircularProgress size={60} thickness={5} data-testid="loading-indicator" />
        </div>
      )}

      {/* Lista de Estudiantes (Vista Profesor/Admin) */}
      {!isStudent(role) && (
        <section className="table-container-full" style={{ marginTop: '40px' }}>
          <Typography variant="h5" className="table-cell-header" sx={{ mb: 2, textAlign: 'center' }}>
            Lista de Estudiantes
          </Typography>
          
          {loadingSubmissions ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <CircularProgress />
            </div>
          ) : (
            <Table className="styled-table">
              <TableHead>
                <TableRow className="table-row-bordered">
                  <TableCell className="table-cell-header">Email</TableCell>
                  <TableCell className="table-cell-header">Estado</TableCell>
                  <TableCell className="table-cell-header">Enlace</TableCell>
                  <TableCell className="table-cell-header">Inicio</TableCell>
                  <TableCell className="table-cell-header">Entrega</TableCell>
                  <TableCell className="table-cell-header">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Aquí renderizamos las filas usando los estilos de botón btn-std */}
                {studentRows}
              </TableBody>
            </Table>
          )}
        </section>
      )}
    </div>
  );
};

export default AssignmentDetail;