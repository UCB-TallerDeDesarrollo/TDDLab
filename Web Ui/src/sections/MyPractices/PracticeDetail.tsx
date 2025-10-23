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
  const [practiceSubmission] = useState<PracticeSubmissionDataObject>();
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "10px",
      }}
    >
      {practice ? (
        <Card variant="elevation" elevation={0}>
          <CardContent>
            <div style={{ marginBottom: "40px" }}>
              <Typography
                variant="h5"
                component="div"
                style={{ fontSize: "30px", lineHeight: "3.8" }}
              >
                {practice.title}
              </Typography>

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
                  <strong>Fecha de Creación:</strong>{" "}
                  {formatDate(datePrac?.toString() ?? "")}
                </Typography>
              </div>

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

            <Button
              variant="contained"
              disabled={submissionStatus[userid.toString()] || false}
              onClick={handleOpenLinkDialog}
              style={{
                textTransform: "none",
                fontSize: "15px",
                marginRight: "8px",
              }}
            >
              Iniciar Practica
            </Button>

            <Button
              variant="contained"
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
              color="primary"
              disabled={!practiceSubmissions[0]?.repository_link}
              style={{
                textTransform: "none",
                fontSize: "15px",
                marginRight: "8px",
              }}
            >
              Ver gráfica
            </Button>


            <GitLinkDialog
              open={linkDialogOpen}
              onClose={handleCloseLinkDialog}
              onSend={handleSendGithubLink}
            />

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
              Finalizar Practica
            </Button>

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
