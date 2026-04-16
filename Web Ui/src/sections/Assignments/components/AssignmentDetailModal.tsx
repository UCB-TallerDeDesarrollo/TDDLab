import React, { useEffect, useState } from "react";
import { formatDate } from "../../../utils/dateUtils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  CircularProgress,
  TableCell,
  TableRow,
  Table,
  TableHead,
  TableBody,
  IconButton,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SubmissionRepository from "../../../modules/Submissions/Repository/SubmissionRepository";
import { CreateSubmission } from "../../../modules/Submissions/Aplication/createSubmission";
import {
  SubmissionCreationObject,
  SubmissionUpdateObject,
} from "../../../modules/Submissions/Domain/submissionInterfaces";
import UsersRepository from "../../../modules/Users/repository/UsersRepository";
import { FinishSubmission } from "../../../modules/Submissions/Aplication/finishSubmission";
import { useNavigate } from "react-router-dom";
import { typographyVariants } from "../../../styles/typography";
import {
  getDisplayStatus,
  isStudent,
  redirectToAdminGraph,
} from "../utils/assignmentDetailHelpers";
import { useAssignmentDetailData } from "../hooks/useAssignmentDetailData";
import { AssignmentDetailInfo } from "./AssignmentDetailInfo";
import { StudentAssignmentActions } from "./StudentAssignmentActions";
import { SubmissionDataObject } from "../../../modules/Submissions/Domain/submissionInterfaces";

interface AssignmentDetailModalProps {
  open: boolean;
  assignmentId: number;
  role: string;
  userid: number;
  onClose: () => void;
}

const AssignmentDetailModal: React.FC<AssignmentDetailModalProps> = ({
  open,
  assignmentId,
  role,
  userid,
  onClose,
}) => {
  const actionButtonStyle = {
    textTransform: "none",
    ...typographyVariants.paragraphMedium,
    marginRight: "8px",
  };

  const detailTextStyle = {
    ...typographyVariants.paragraphBig,
    lineHeight: "1.8",
  };

  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [studentRows, setStudentRows] = useState<React.ReactElement[]>([]);
  const {
    assignment,
    groupDetails,
    loadingSubmissions,
    submissions,
    studentSubmission,
    submission,
    showIAButton,
    disableAdditionalGraphs,
    refreshAssignmentDetailData,
  } = useAssignmentDetailData({ assignmentid: assignmentId, userid, role });

  const navigate = useNavigate();
  const usersRepository = new UsersRepository();

  useEffect(() => {
    renderStudentRows();
  }, [submissions]);

  const isTaskInProgress = submission?.status !== "in progress";

  const handleSendGithubLink = async (repository_link: string) => {
    if (assignmentId) {
      const submissionsRepository = new SubmissionRepository();
      const createSubmission = new CreateSubmission(submissionsRepository);
      const startDate = new Date();
      const start_date = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate()
      );
      const submissionData: SubmissionCreationObject = {
        assignmentid: assignmentId,
        userid: userid,
        status: "in progress",
        repository_link: repository_link,
        start_date: start_date,
      };
      try {
        await createSubmission.createSubmission(submissionData);
        handleCloseLinkDialog();
        await refreshAssignmentDetailData();
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
  };

  const handleRedirectAdmin = (
    link: string,
    fetchedSubmissions: SubmissionDataObject[],
    submissionId: number,
    url: string
  ) => {
    if (link) {
      const redirected = redirectToAdminGraph(
        navigate,
        link,
        fetchedSubmissions,
        submissionId,
        url
      );

      if (!redirected) {
        alert("Link Invalido, por favor ingrese un link valido.");
      }
    } else {
      alert("No se encontro un link para esta tarea.");
    }
  };

  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);

  const handleOpenCommentDialog = () => {
    setIsCommentDialogOpen(true);
  };

  const handleCloseCommentDialog = () => {
    setIsCommentDialogOpen(false);
  };

  const handleSendComment = async (comment: string) => {
    if (submission) {
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
        comment: comment,
      };
      try {
        await finishSubmission.finishSubmission(submission.id, submissionData);
        await refreshAssignmentDetailData();
      } catch (error) {
        throw error;
      }
    }
    handleCloseCommentDialog();
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
          <TableRow key={submission.id}>
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
                  handleRedirectAdmin(
                    submission.repository_link,
                    submissions,
                    submission.id,
                    "/graph"
                  );
                }}
                color="primary"
                style={actionButtonStyle}
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
                    state: { repositoryLink: submission.repository_link },
                  });
                }}
                color="primary"
                style={actionButtonStyle}
              >
                Asistente IA
              </Button>
            </TableCell>
            {!isStudent(role) && (
              <TableCell>
                <Button
                  variant="contained"
                  disabled={
                    submission.repository_link === "" ||
                    disableAdditionalGraphs
                  }
                  onClick={() => {
                    localStorage.setItem("selectedMetric", "Complejidad");
                    handleRedirectAdmin(
                      submission.repository_link,
                      submissions,
                      submission.id,
                      "/aditionalgraph"
                    );
                  }}
                  color="primary"
                  style={{ ...actionButtonStyle, marginRight: "7px" }}
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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingRight: "8px",
        }}
      >
        <span style={{ flex: 1 }}>Detalles de la Tarea</span>
        <Tooltip title="Cerrar">
          <IconButton
            onClick={onClose}
            sx={{
              color: "text.secondary",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </DialogTitle>
      <DialogContent dividers sx={{ overflowY: "auto", maxHeight: "70vh" }}>
        {assignment ? (
          <>
            <div style={{ marginBottom: "32px" }}>
              <AssignmentDetailInfo
                assignment={assignment}
                groupDetails={groupDetails}
                role={role}
                studentSubmission={studentSubmission}
                detailTextStyle={detailTextStyle}
              />
            </div>

            <div style={{ marginBottom: "32px" }}>
              <StudentAssignmentActions
                role={role}
                studentSubmission={studentSubmission}
                submissionLink={submission?.repository_link}
                showIAButton={showIAButton}
                isTaskInProgress={isTaskInProgress}
                actionButtonStyle={actionButtonStyle}
                linkDialogOpen={linkDialogOpen}
                isCommentDialogOpen={isCommentDialogOpen}
                onOpenLinkDialog={handleOpenLinkDialog}
                onStudentGraph={() => {
                  localStorage.setItem("selectedMetric", "Dashboard");
                  if (studentSubmission?.repository_link) {
                    const submissionId = submission?.id;
                    if (submissionId) {
                      navigate("/graph", {
                        state: {
                          repositoryLink: studentSubmission.repository_link,
                          submissionId: submissionId,
                        },
                      });
                    }
                  }
                }}
                onOpenCommentDialog={handleOpenCommentDialog}
                onOpenAssistant={() => {
                  localStorage.setItem("selectedMetric", "AssistantAI");
                  navigate("/asistente-ia", {
                    state: {
                      repositoryLink: studentSubmission?.repository_link,
                    },
                  });
                }}
                onCloseLinkDialog={handleCloseLinkDialog}
                onSendGithubLink={handleSendGithubLink}
                onCloseCommentDialog={handleCloseCommentDialog}
                onSendComment={handleSendComment}
              />
            </div>

            {!isStudent(role) && studentRows.length > 0 && (
              <div style={{ marginTop: "32px" }}>
                <h3 style={{ marginBottom: "16px" }}>Envíos de Estudiantes</h3>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Email</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Enlace</TableCell>
                      <TableCell>Inicio</TableCell>
                      <TableCell>Fin</TableCell>
                      <TableCell>Comentario</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>{studentRows}</TableBody>
                </Table>
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "250px",
            }}
          >
            <CircularProgress size={60} thickness={5} />
          </div>
        )}
      </DialogContent>
      <DialogActions sx={{ padding: "16px" }}>
        <Button onClick={onClose} variant="outlined" color="primary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignmentDetailModal;
