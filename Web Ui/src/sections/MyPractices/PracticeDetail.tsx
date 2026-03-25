import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PracticesRepository from "../../modules/Practices/repository/PracticesRepository.ts";
import { Button, Card, CardContent, Typography } from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  Link as LinkIcon,
} from "@mui/icons-material";
import { GitLinkDialog } from "../Assignments/components/GitHubLinkDialog.tsx";
import { CommentDialog } from "../Assignments/components/CommentDialog.tsx";
import CircularProgress from "@mui/material/CircularProgress";
import PracticeSubmissionRepository from "../../modules/PracticeSubmissions/Repository/PracticeSubmissionRepository.ts";
import { CreatePracticeSubmission } from "../../modules/PracticeSubmissions/Application/CreatePracticeSubmission.ts";
import {
  PracticeSubmissionCreationObject,
  PracticeSubmissionDataObject,
  PracticeSubmissionUpdateObject,
} from "../../modules/PracticeSubmissions/Domain/PracticeSubmissionInterface.ts";
import { CheckPracticeSubmissionExists } from "../../modules/PracticeSubmissions/Application/CheckPracticeSubmissionExists.ts";
import { GetPracticeSubmissionsByPracticeId } from "../../modules/PracticeSubmissions/Application/getPracticeSubmissionByPracticeId.ts";
import { FinishPracticeSubmission } from "../../modules/PracticeSubmissions/Application/FinishPracticeSubmission.ts";
import { GetPracticeSubmissionByUserandPracticeSubmissionId } from "../../modules/PracticeSubmissions/Application/getPracticeSubmissionByUserIdAnPracticeSubmissionId.ts";
import { GetPracticeById } from "../../modules/Practices/application/GetPracticeById.ts";
import { formatDate } from "../../utils/dateUtils.ts";
import { handleRedirectStudent } from "../Shared/handlers.ts";
import "../../App.css";

interface PracticeDetailProps {
  title: string;
  userid: number;
}

const PracticeDetail: React.FC<PracticeDetailProps> = ({ userid }) => {
  const [practice, setPractice] = useState<PracticeDetailProps | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const { id } = useParams();
  const practiceid = Number(id);
  const [submissionStatus, setSubmissionStatus] = useState<{
    [key: string]: boolean;
  }>({});

  const [_, setLoadingPracticeSubmissions] = useState(true);
  const [practiceSubmissions, setPracticeSubmissions] = useState<
    PracticeSubmissionDataObject[]
  >([]);
  const [_submissionsError, setSubmissionsError] = useState<string | null>(
    null
  );

  const [datePrac, setDatePrac] = useState<Date | null>(null);

  const [submission, setPracticeSubmission] =
    useState<PracticeSubmissionDataObject | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const practiceSubmissionRepository = new PracticeSubmissionRepository();
    const practiceSubmissionData =
      new GetPracticeSubmissionByUserandPracticeSubmissionId(
        practiceSubmissionRepository
      );
    practiceSubmissionData
      .getPracticeSubmisssionByUserandPracticeSubmissionId(practiceid, userid)
      .then((fetchedPracticeSubmission) => {
        setPracticeSubmission(fetchedPracticeSubmission);
      })
      .catch((error) => {
        console.error("Error fetching submission:", error);
      });
  }, [practiceid, userid]);

  useEffect(() => {
    const practiceRepository = new PracticesRepository();
    const getPracticeDetail = new GetPracticeById(practiceRepository);

    getPracticeDetail
      .obtainAssignmentDetail(practiceid)
      .then((fetchedPractice) => {
        if (fetchedPractice) {
          setDatePrac(fetchedPractice.creation_date);
          // Actualiza el estado con la fecha correcta
          setPractice({
            ...fetchedPractice,
            userid: fetchedPractice.userid ?? 0, // Usa un valor predeterminado si `userid` es undefined
          });
        } else {
          setDatePrac(null);
          setPractice(null); // Maneja el caso de datos nulos
        }
      })
      .catch((error) => {
        console.error("Error fetching practice:", error);
      });
  }, [practiceid]);
  useEffect(() => {
    const checkIfStarted = async () => {
      if (userid && userid !== -1) {
        try {
          const practiceSubmissionRepository =
            new PracticeSubmissionRepository();
          const checkPracticeSubmissionExists =
            new CheckPracticeSubmissionExists(practiceSubmissionRepository);
          const response =
            await checkPracticeSubmissionExists.checkPracticeSubmissionExists(
              practiceid,
              userid
            );
          setSubmissionStatus((prevStatus) => ({
            ...prevStatus,
            [userid]: !!response,
          }));
        } catch (error) {
          console.error("Error checking submission status:", error);
        }
      }
    };

    checkIfStarted();
  }, [practiceid, userid]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const practiceSubmissionRepository = new PracticeSubmissionRepository();
        const getPracticeSubmissionsByAssignmentId =
          new GetPracticeSubmissionsByPracticeId(practiceSubmissionRepository);
        const fetchedSubmissions =
          await getPracticeSubmissionsByAssignmentId.getPracticeSubmissionsByPracticeId(
            practiceid
          );
        setPracticeSubmissions(fetchedSubmissions);
      } catch (error) {
        setSubmissionsError(
          "Error fetching practice submissions. Please try again later."
        );
        console.error(
          "Error fetching PracticeSubmissionByPracticeAndUser:",
          error
        );
      } finally {
        setLoadingPracticeSubmissions(false);
      }
    };

    fetchSubmissions();
  }, [practiceid]);

  useEffect(() => { }, [practiceSubmissions]);

  const isTaskInProgress = submission?.status !== "in progress";

  const handleSendGithubLink = async (repository_link: string) => {
    if (practiceid) {
      const practiceSubmissionsRepository = new PracticeSubmissionRepository();
      const createPracticeSubmission = new CreatePracticeSubmission(
        practiceSubmissionsRepository
      );
      const startDate = new Date();
      const start_date = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate()
      );
      const practiceSubmissionData: PracticeSubmissionCreationObject = {
        practiceid: practiceid,
        userid: userid,
        status: "in progress",
        repository_link: repository_link,
        start_date: start_date,
      };
      try {
        await createPracticeSubmission.createPracticeSubmission(
          practiceSubmissionData
        );
        handleCloseLinkDialog();
      } catch (error) {
        console.error(error);
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
      const submissionRepository = new PracticeSubmissionRepository();
      const finishSubmission = new FinishPracticeSubmission(
        submissionRepository
      );
      const endDate = new Date();
      const end_date = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate()
      );
      const submissionData: PracticeSubmissionUpdateObject = {
        id: submission?.id,
        status: "delivered",
        end_date: end_date,
        comment: comment,
      };
      try {
        await finishSubmission.finishSubmission(submission.id, submissionData);
        handleCloseLinkDialog();
      } catch (error) {
        console.error(error);
      }
    }
    handleCloseCommentDialog();
    window.location.reload();
  };

  return (
    <div className="centered-container">
      {practice ? (
        <Card variant="elevation" elevation={0}>
          <CardContent>
            <div style={{ marginBottom: "40px" }}>
              <Typography variant="h5" className="detail-header-title">
                {practice.title}
              </Typography>

              <div className="detail-info-row">
                <AccessTimeIcon className="detail-info-icon" />
                <Typography variant="body2" color="text.secondary" className="detail-info-text">
                  <strong>Fecha de Creación:</strong>{" "}
                  {formatDate(datePrac?.toString() ?? "")}
                </Typography>
              </div>

              <div className="detail-info-row">
                <LinkIcon className="detail-info-icon" />
                <Typography variant="body2" color="text.secondary" className="detail-info-text">
                  <strong>Enlace:</strong>
                  <a
                    href={practiceSubmissions[0]?.repository_link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {practiceSubmissions[0]?.repository_link ??
                      " No se inicio la practica"}
                  </a>
                </Typography>
              </div>
            </div>

            <div className="detail-actions-container">
              <Button
                variant="contained"
                disabled={submissionStatus[userid.toString()] || false}
                onClick={handleOpenLinkDialog}
                className="btn-std btn-primary"
              >
                Iniciar Practica
              </Button>

              <Button
                variant="contained"
                className="btn-std btn-primary"
                onClick={() => {
                  localStorage.setItem("selectedMetric", "Dashboard");
                  if (practiceSubmissions[0]?.repository_link) {
                    handleRedirectStudent(
                      practiceSubmissions[0].repository_link,
                      practiceSubmissions[0].id,
                      navigate
                    );
                  }
                }}
                disabled={!practiceSubmissions[0]?.repository_link}
              >
                Ver gráfica
              </Button>

              <Button
                variant="contained"
                disabled={isTaskInProgress}
                onClick={handleOpenCommentDialog}
                className="btn-std btn-primary"
              >
                Finalizar Practica
              </Button>
            </div>

            <GitLinkDialog
              open={linkDialogOpen}
              onClose={handleCloseLinkDialog}
              onSend={handleSendGithubLink}
            />
              
            <CommentDialog
              open={isCommentDialogOpen}
              link={submission?.repository_link}
              onSend={handleSendComment}
              onClose={handleCloseCommentDialog}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="centered-container">
          <CircularProgress
            size={60}
            thickness={5}
            data-testid="loading-indicator"
          />
        </div>
      )}
    </div>
  );
};

export default PracticeDetail;
