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
  CircularProgress,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline"; // Icono de negación
import {
  AccessTime as AccessTimeIcon,
  Link as LinkIcon,
} from "@mui/icons-material";

import { GitLinkDialog } from "./components/GitHubLinkDialog";
import { CommentDialog } from "./components/CommentDialog";
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

import { handleRedirectStudent } from '../Shared/handlers.ts';

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

const AssignmentDetail: React.FC<AssignmentDetailProps> = ({ role, userid }) => {
  const [assignment, setAssignment] = useState<AssignmentDataObject | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const { id } = useParams();
  const assignmentid = Number(id);
  const [groupDetails, setGroupDetails] = useState<GroupDataObject | null>(null);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [submissions, setSubmissions] = useState<SubmissionDataObject[]>([]);
  const [studentSubmission, setStudentSubmission] = useState<SubmissionDataObject>();
  const [studentRows, setStudentRows] = useState<JSX.Element[]>([]);
  const [submission, setSubmission] = useState<SubmissionDataObject | null>(null);
  const [showIAButton, setShowIAButton] = useState(false);
  const [disableAdditionalGraphs, setDisableAdditionalGraphs] = useState(true);

  const navigate = useNavigate();
  const usersRepository = new UsersRepository();

  // --- USE EFFECTS (Lógica de Datos) ---

  useEffect(() => {
    const fetchFlag = async () => {
      if (!isStudent(role)) {
        const getFlagUseCase = new GetFeatureFlagByName();
        try {
          const flag = await getFlagUseCase.execute("Mostrar Graficas Adicionales");
          setDisableAdditionalGraphs(!(flag?.is_enabled));
        } catch (error) {
          console.error("Error al obtener flag gráficas:", error);
          setDisableAdditionalGraphs(true);
        }
      }
    };
    fetchFlag();
  }, [role]);

  useEffect(() => {
    if (!isStudent(role)) return;
    const fetchFeatureFlag = async () => {
      try {
        const getFlagUseCase = new GetFeatureFlagByName();
        const flag = await getFlagUseCase.execute("Boton Asistente IA");
        setShowIAButton(flag?.is_enabled ?? true);
      } catch (error) {
        console.error("Error fetching feature flag IA_ASSISTANT:", error);
      }
    };
    fetchFeatureFlag();
  }, [role]);

  useEffect(() => {
    const fetchSubmission = async () => {
      if (assignmentid && userid && userid !== -1) {
        try {
          const submissionRepository = new SubmissionRepository();
          const submissionData = new GetSubmissionByUserandAssignmentId(submissionRepository);
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
    getAssignmentDetail.obtainAssignmentDetail(assignmentid)
      .then(setAssignment)
      .catch((error) => console.error("Error fetching assignment:", error));
  }, [assignmentid]);

  useEffect(() => {
    if (assignment?.groupid) {
      const groupsRepository = new GroupsRepository();
      const getGroupDetail = new GetGroupDetail(groupsRepository);
      getGroupDetail.obtainGroupDetail(assignment.groupid)
        .then(setGroupDetails)
        .catch((error) => console.error("Error fetching group details:", error));
    }
  }, [assignment]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!isStudent(role)) {
        setLoadingSubmissions(true);
        try {
          const submissionRepository = new SubmissionRepository();
          const getSubmissionsByAssignmentId = new GetSubmissionsByAssignmentId(submissionRepository);
          const fetchedSubmissions = await getSubmissionsByAssignmentId.getSubmissionsByAssignmentId(assignmentid);
          setSubmissions(fetchedSubmissions);
        } catch (error) {
          console.error("Error fetching submissions:", error);
        } finally {
          setLoadingSubmissions(false);
        }
      }
    };
    fetchSubmissions();
  }, [assignmentid, role]);

  useEffect(() => {
    renderStudentRows();
  }, [submissions, disableAdditionalGraphs]);

  // --- HANDLERS ---

  const handleOpenLinkDialog = () => setLinkDialogOpen(true);
  const handleCloseLinkDialog = () => {
    setLinkDialogOpen(false);
    window.location.reload();
  };

  const handleSendGithubLink = async (repository_link: string) => {
    if (assignmentid) {
      const submissionsRepository = new SubmissionRepository();
      const createSubmission = new CreateSubmission(submissionsRepository);
      const startDate = new Date();
      const submissionData: SubmissionCreationObject = {
        assignmentid,
        userid,
        status: "in progress",
        repository_link,
        start_date: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()),
      };
      await createSubmission.createSubmission(submissionData);
      handleCloseLinkDialog();
    }
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
            submissionId: submissionId.toString(),
          }).toString(),
        });
      } else {
        alert("Link Invalido.");
      }
    } else {
      alert("No se encontró link.");
    }
  };

  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const handleOpenCommentDialog = () => setIsCommentDialogOpen(true);
  const handleCloseCommentDialog = () => setIsCommentDialogOpen(false);

  const handleSendComment = async (comment: string) => {
    if (submission) {
      const submissionRepository = new SubmissionRepository();
      const finishSubmission = new FinishSubmission(submissionRepository);
      const endDate = new Date();
      const submissionData: SubmissionUpdateObject = {
        id: submission.id,
        status: "delivered",
        end_date: new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()),
        comment,
      };
      await finishSubmission.finishSubmission(submission.id, submissionData);
      window.location.reload();
    }
  };

  const getStudentEmailById = async (studentId: number): Promise<string> => {
    try {
      const student = await usersRepository.getUserById(studentId);
      return student.email;
    } catch { return ""; }
  };

  // --- RENDERIZADO DE FILAS (CAMBIOS SOLICITADOS) ---

  const renderStudentRows = async () => {
    const rows = await Promise.all(
      submissions.map(async (sub) => {
        const studentEmail = await getStudentEmailById(sub.userid);
        const formattedStartDate = formatDate(sub.start_date.toString());
        const formattedEndDate = sub.end_date ? formatDate(sub.end_date.toString()) : "N/A";

        // Estilos de estado
        const isDelivered = sub.status === "delivered";
        const statusClass = isDelivered ? "text-status-enviado" : "text-status-no-enviado";
        const statusLabel = isDelivered ? "Enviado" : "No enviado";

        return (
          <TableRow key={generateUniqueId()} className="table-row-bordered">
            <TableCell>{studentEmail}</TableCell>
            <TableCell className={statusClass}>{statusLabel}</TableCell>
            
            {/* Icono de Enlace Gris */}
            <TableCell align="center">
              {sub.repository_link ? (
                <a href={sub.repository_link} target="_blank" rel="noopener noreferrer">
                  <LinkIcon className="icon-gray" />
                </a>
              ) : (
                <RemoveCircleOutlineIcon className="icon-gray" />
              )}
            </TableCell>

            <TableCell>{formattedStartDate}</TableCell>
            <TableCell>{formattedEndDate}</TableCell>

            {/* Botón Gráfica */}
            <TableCell>
              <Button
                className="btn-std btn-primary"
                disabled={!sub.repository_link}
                onClick={() => handleRedirectAdmin(sub.repository_link, submissions, sub.id, "/graph")}
              >
                Ver gráfica
              </Button>
            </TableCell>

            {/* Botón Asistente */}
            <TableCell>
              <Button
                className="btn-std btn-primary"
                disabled={!sub.repository_link}
                onClick={() => navigate("/asistente-ia", { state: { repositoryLink: sub.repository_link } })}
              >
                Asistente
              </Button>
            </TableCell>

            {/* Botón Ver Más (Gráficas Adicionales) */}
            <TableCell>
              <Button
                className="btn-std btn-primary"
                disabled={!sub.repository_link || disableAdditionalGraphs}
                onClick={() => handleRedirectAdmin(sub.repository_link, submissions, sub.id, "/aditionalgraph")}
              >
                Ver
              </Button>
            </TableCell>
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
              <div className="detail-item">
                <ArchiveOutlinedIcon className="detail-icon" />
                <Typography variant="body1"><strong>Grupo:</strong> {groupDetails?.groupName}</Typography>
              </div>
              <div className="detail-item">
                <NotesOutlinedIcon className="detail-icon" />
                <Typography variant="body1"><strong>Instrucciones:</strong> {assignment.description}</Typography>
              </div>
              <div className="detail-item">
                <CalendarMonthIcon className="detail-icon" />
                <Typography variant="body1"><strong>Inicio:</strong> {formatDate(assignment.start_date.toString())}</Typography>
              </div>
              <div className="detail-item">
                <CalendarMonthIcon className="detail-icon" />
                <Typography variant="body1"><strong>Fecha límite:</strong> {formatDate(assignment.end_date.toString())}</Typography>
              </div>
            </div>

            {isStudent(role) && (
              <div className="action-buttons-group" style={{ justifyContent: 'flex-start', marginTop: '20px' }}>
                <Button disabled={!!submission} onClick={handleOpenLinkDialog} className="btn-std btn-primary">Iniciar tarea</Button>
                <Button disabled={!submission?.repository_link} onClick={() => handleRedirectStudent(submission!.repository_link, submission!.id, navigate)} className="btn-std btn-primary">Ver gráfica</Button>
                <Button disabled={submission?.status !== "in progress"} onClick={handleOpenCommentDialog} className="btn-std btn-primary">Finalizar tarea</Button>
                {showIAButton && (
                  <Button disabled={!submission?.repository_link} onClick={() => navigate("/asistente-ia", { state: { repositoryLink: submission?.repository_link } })} className="btn-std btn-primary">Asistente IA</Button>
                )}
              </div>
            )}
            
            <GitLinkDialog open={linkDialogOpen} onClose={handleCloseLinkDialog} onSend={handleSendGithubLink} />
            <CommentDialog open={isCommentDialogOpen} link={submission?.repository_link} onSend={handleSendComment} onClose={handleCloseCommentDialog} />
          </CardContent>
        </Card>
      ) : (
        <div className="fullscreen-loading"><CircularProgress size={60} thickness={5} /></div>
      )}

      {!isStudent(role) && (
        <section className="table-container-full" style={{ marginTop: '40px' }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'left', borderBottom: '1px solid #eee', pb: 1 }}>
            Lista de entregas
          </Typography>
          
          {loadingSubmissions ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><CircularProgress /></div>
          ) : (
            <Table className="styled-table">
              <TableHead>
                <TableRow className="table-row-bordered">
                  <TableCell className="table-cell-header">Correo</TableCell>
                  <TableCell className="table-cell-header">Estado</TableCell>
                  <TableCell className="table-cell-header" align="center">Enlace</TableCell>
                  <TableCell className="table-cell-header">Fecha de Inicio</TableCell>
                  <TableCell className="table-cell-header">Fecha de finalización</TableCell>
                  <TableCell className="table-cell-header">Grafica</TableCell>
                  <TableCell className="table-cell-header">Asistente AI</TableCell>
                  <TableCell className="table-cell-header">Graficas Adicionales</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
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