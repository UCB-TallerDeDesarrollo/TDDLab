import React, { useEffect, useState } from "react";
import { formatDate } from "../../utils/dateUtils";
import { useParams, useNavigate } from "react-router-dom";

import {
  Button,
  TableCell,
  TableRow,
  Box,
  Divider,
  Typography
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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
  handleRedirectStudent,
} from '../Shared/handlers.ts';
import { typographyVariants } from "../../styles/typography";
import {
  getDisplayStatus,
  isStudent,
  redirectToAdminGraph,
} from "./utils/assignmentDetailHelpers";
import { useAssignmentDetailData } from "./hooks/useAssignmentDetailData";
import { AssignmentDetailInfo } from "./components/AssignmentDetailInfo";
import { StudentAssignmentActions } from "./components/StudentAssignmentActions";
import { AssignmentSubmissionsTable } from "./components/AssignmentSubmissionsTable";
import { SubmissionDataObject } from "../../modules/Submissions/Domain/submissionInterfaces";


interface AssignmentDetailProps {
  role: string;
  userid: number;
}

const AssignmentDetail: React.FC<AssignmentDetailProps> = ({
  role,
  userid,
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
  const { id } = useParams();
  const assignmentid = Number(id);
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
  } = useAssignmentDetailData({ assignmentid, userid, role });


  const navigate = useNavigate();
  const usersRepository = new UsersRepository();


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

  const handleRedirectAdmin = (link: string, fetchedSubmissions: SubmissionDataObject[], submissionId: number, url: string) => {
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
        comment: comment
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
          <TableRow key={submission.id} sx={{ backgroundColor: '#fff', '& td': { borderBottom: '1px solid #f0f0f0' } }}>
            <TableCell align="center">{studentEmail}</TableCell>
            <TableCell align="center">{getDisplayStatus(submission.status)}</TableCell>
            <TableCell align="center">
              <a
                href={submission.repository_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {submission.repository_link}
              </a>
            </TableCell>
            <TableCell align="center">{formattedStartDate}</TableCell>
            <TableCell align="center">{formattedEndDate}</TableCell>
            <TableCell align="center">{submission.comment || "N/A"}</TableCell>
            <TableCell align="center">
              <Button
                variant="contained"
                disabled={submission.repository_link === ""}
                onClick={() => {
                  localStorage.setItem("selectedMetric", "Dashboard");
                  handleRedirectAdmin(submission.repository_link, submissions, submission.id, "/graph")
                }}
                color="primary"
                style={{ ...actionButtonStyle, borderRadius: '8px', boxShadow: 'none' }}
              >
                Ver
              </Button>
            </TableCell>

            <TableCell align="center">
              <Button
                variant="contained"
                disabled={submission.repository_link === ""}
                onClick={() => {
                  navigate("/asistente-ia", {
                    state: { repositoryLink: submission.repository_link },
                  });
                }}
                color="primary"
                style={{ ...actionButtonStyle, borderRadius: '8px', boxShadow: 'none' }}
              >
                Asistente
              </Button>
            </TableCell>
            {!isStudent(role) && (
              <TableCell align="center">
                <Button
                  variant="contained"
                  disabled={submission.repository_link === "" || disableAdditionalGraphs}
                  onClick={() => {
                    localStorage.setItem("selectedMetric", "Complejidad");
                    handleRedirectAdmin(submission.repository_link, submissions, submission.id, "/aditionalgraph")
                  }}
                  color="primary"
                  style={{ ...actionButtonStyle, marginRight: "7px", borderRadius: '8px', boxShadow: 'none' }}
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