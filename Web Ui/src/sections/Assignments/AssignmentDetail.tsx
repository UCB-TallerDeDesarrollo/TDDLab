import React, { useCallback, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  Button,
  Box,
  Divider,
  Typography
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CircularProgress from "@mui/material/CircularProgress";
import { SubmissionDataObject } from "../../modules/Submissions/Domain/submissionInterfaces";

import {
  handleRedirectStudent,
} from '../Shared/handlers.ts';
import { typographyVariants } from "../../styles/typography";
import {
  isStudent,
  redirectToAdminGraph,
} from "./utils/assignmentDetailHelpers";
import { useAssignmentDetailData } from "./hooks/useAssignmentDetailData";
import { AssignmentDetailInfo } from "./components/AssignmentDetailInfo";
import { StudentAssignmentActions } from "./components/StudentAssignmentActions";
import { AssignmentSubmissionsTable } from "./components/AssignmentSubmissionsTable";
import { useStudentSubmissionRows } from "./hooks/useStudentSubmissionRows";
import {
  createAssignmentSubmission,
  finishAssignmentSubmission,
} from "./utils/submissionActions";


interface AssignmentDetailProps {
  role: string;
  userid: number;
}

const AssignmentDetail: React.FC<AssignmentDetailProps> = ({
  role,
  userid,
}) => {
  const actionButtonStyle = useMemo(
    () => ({
      textTransform: "none",
      ...typographyVariants.paragraphMedium,
      marginRight: "8px",
    }),
    []
  );

  const detailTextStyle = {
    ...typographyVariants.paragraphBig,
    lineHeight: "1.8",
  };

  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const { id } = useParams();
  const assignmentid = Number(id);
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
  } = useAssignmentDetailData({ assignmentid, userid, role });


  const navigate = useNavigate();
  const studentRowSx = useMemo(
    () => ({
      backgroundColor: "#fff",
      "& td": { borderBottom: "1px solid #f0f0f0" },
    }),
    []
  );

  const isTaskInProgress = submission?.status !== "in progress";

  const handleSendGithubLink = async (repository_link: string) => {
    if (assignmentid) {
      try {
        await createAssignmentSubmission({
          assignmentId: assignmentid,
          userId: userid,
          repositoryLink: repository_link,
        });
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
    rowSx: studentRowSx,
    cellAlign: "center",
  });
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);

  const handleOpenCommentDialog = () => {
    setIsCommentDialogOpen(true);
  };

  const handleCloseCommentDialog = () => {
    setIsCommentDialogOpen(false);
  };

  const handleSendComment = async (comment: string) => {
    if (submission) {
      try {
        await finishAssignmentSubmission({
          submissionId: submission.id,
          comment,
        });
        await refreshAssignmentDetailData();
      } catch (error) {
        throw error;
      }
    }
    handleCloseCommentDialog();
  };


  return (

    <Box sx={{ width: { xs: '95%', sm: '90%', md: '92%' }, ml: { xs: 'auto', md: '40px' }, mr: { xs: 'auto', md: 0 }, mt: 2 }}>
      <Box sx={{ mb: 1 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/")}
          sx={{ color: '#666', textTransform: 'none', fontWeight: 600, fontSize: '1rem', padding: 0, '&:hover': { backgroundColor: 'transparent', color: '#1a1a1a' } }}
        >
          Volver a Tareas
        </Button>
      </Box>
      {assignment ? (
        <Box sx={{ mb: 4, mt: 2 }}>
          <AssignmentDetailInfo
            assignment={assignment}
            groupDetails={groupDetails}
            role={role}
            studentSubmission={studentSubmission}
            detailTextStyle={detailTextStyle}
          />

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
                handleRedirectStudent(studentSubmission.repository_link, studentSubmission.id, navigate);
              }
            }}
            onOpenCommentDialog={handleOpenCommentDialog}
            onOpenAssistant={() => {
              localStorage.setItem("selectedMetric", "AssistantAI");
              navigate("/asistente-ia", {
                state: { repositoryLink: studentSubmission?.repository_link },
              });
            }}
            onCloseLinkDialog={handleCloseLinkDialog}
            onSendGithubLink={handleSendGithubLink}
            onCloseCommentDialog={handleCloseCommentDialog}
            onSendComment={handleSendComment}
          />
        </Box>
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
        <Box sx={{ mt: 4, mb: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: '600', mb: 2, color: '#1a1a1a', fontSize: '1.5rem' }}>
            Lista de entregas
          </Typography>
          <Divider sx={{ mb: 4, borderColor: '#e0e0e0' }} />
        </Box>
      )}

      <AssignmentSubmissionsTable
        role={role}
        loadingSubmissions={loadingSubmissions}
        studentRows={studentRows}
      />
    </Box>
  );
};

export default AssignmentDetail;