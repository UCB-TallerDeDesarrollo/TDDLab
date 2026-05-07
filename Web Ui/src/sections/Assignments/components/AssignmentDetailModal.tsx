import React, { useCallback, useMemo } from "react";
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
import { SubmissionDataObject } from "../../../modules/Submissions/Domain/submissionInterfaces";
import { useNavigate } from "react-router-dom";
import { isStudent, redirectToAdminGraph } from "../utils/assignmentDetailHelpers";
import { useAssignmentDetailData } from "../hooks/useAssignmentDetailData";
import { AssignmentDetailInfo } from "./AssignmentDetailInfo";
import { StudentAssignmentActions } from "./StudentAssignmentActions";
import { useStudentSubmissionRows } from "../hooks/useStudentSubmissionRows";
import { useAssignmentDetailStyles } from "../hooks/useAssignmentDetailStyles";
import { useAssignmentSubmissionActions } from "../hooks/useAssignmentSubmissionActions";

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
  const { actionButtonStyle, detailTextStyle } = useAssignmentDetailStyles();
  const {
    assignment,
    groupDetails,
    submissions,
    studentSubmission,
    submission,
    showIAButton,
    disableAdditionalGraphs,
    refreshAssignmentDetailData,
  } = useAssignmentDetailData({ assignmentid: assignmentId, userid, role });

  const navigate = useNavigate();
  const studentRowLabels = useMemo(
    () => ({
      viewGraph: "Ver gráfica",
      assistant: "Asistente IA",
      additionalGraphs: "Ver gráficas adicionales",
    }),
    []
  );

  const {
    linkDialogOpen,
    isCommentDialogOpen,
    isTaskInProgress,
    handleOpenLinkDialog,
    handleCloseLinkDialog,
    handleOpenCommentDialog,
    handleCloseCommentDialog,
    handleSendGithubLink,
    handleSendComment,
  } = useAssignmentSubmissionActions({
    assignmentId: assignmentId,
    userId: userid,
    submission: submission,
    refreshAssignmentDetailData,
  });

  const handleRedirectAdmin = useCallback(
    (
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
    },
    [navigate]
  );
  const handleOpenAssistant = useCallback(
    (repositoryLink: string) => {
      navigate("/asistente-ia", {
        state: { repositoryLink },
      });
    },
    [navigate]
  );
  const studentRows = useStudentSubmissionRows({
    submissions,
    role,
    disableAdditionalGraphs,
    actionButtonStyle,
    onRedirectAdmin: handleRedirectAdmin,
    onOpenAssistant: handleOpenAssistant,
    labels: studentRowLabels,
  });

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
