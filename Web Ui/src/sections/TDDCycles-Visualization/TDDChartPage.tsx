import React, { useEffect, useState } from "react";
import { PortGetTDDCycles } from "../../modules/TDDCycles-Visualization/application/GetTDDCycles";
import TDDCharts from "./components/TDDChart";
import { CommitDataObject } from "../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import "./styles/TDDChartPageStyles.css";
import { useSearchParams, useNavigate } from "react-router-dom";
import { PropagateLoader } from "react-spinners";
import { CommitHistoryRepository } from "../../modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterface";
import { CommitHistoryAdapter } from "../../modules/TDDCycles-Visualization/repository/CommitHistoryAdapter";
import TeacherCommentsRepository from "../../modules/teacherCommentsOnSubmissions/repository/CommentsRepository";
import { CommentDataObject, CommentsCreationObject } from "../../modules/teacherCommentsOnSubmissions/domain/CommentsInterface";
import { ComplexityObject } from "../../modules/TDDCycles-Visualization/domain/ComplexityInterface";
import UsersRepository from "../../modules/Users/repository/UsersRepository";
import { CommitCycle } from "../../modules/TDDCycles-Visualization/domain/TddCycleInterface";

interface CycleReportViewProps {
  port: CommitHistoryRepository;
  role: string;
  teacher_id: number;
  graphs: string;
}

interface Submission {
  id: number;
  repository_link: string;
}

function isStudent(role: string) {
  return role === "student";
}

function TDDChartPage({ port, role, teacher_id, graphs }: Readonly<CycleReportViewProps>) {
  let DefaultItem = "";
  if (graphs === "graph") {
    DefaultItem = "Dashboard";
  } else {
    DefaultItem = "Complejidad";
  }

  const [searchParams] = useSearchParams();
  const commentsRepo = new TeacherCommentsRepository();
  const navigate = useNavigate();
  const usersRepository = new UsersRepository();

  const repoOwner: string = String(searchParams.get("repoOwner")) || "defaultOwner";
  const repoName: string = String(searchParams.get("repoName")) || "defaultRepo";
  const submissionIdcomments = parseInt(searchParams.get("submissionId") || "0");
  const fetchedSubmissions: Submission[] = !isStudent(role)
    ? JSON.parse(searchParams.get("fetchedSubmissions") || "[]")
    : [];
  const submissionId = !isStudent(role)
    ? Number(searchParams.get("submissionId"))
    : 0;

  const [currentIndex, setCurrentIndex] = useState(
    !isStudent(role)
      ? fetchedSubmissions.findIndex((submission) => submission.id === submissionId)
      : 0
  );

  const [ownerName, setOwnerName] = useState<string>("");
  const [commitsInfo, setCommitsInfo] = useState<CommitDataObject[] | null>(null);
  const [commitsTddCycles, setCommitsTddCycles] = useState<CommitCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<CommentDataObject[] | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [complexity, setComplexity] = useState<ComplexityObject[] | null>(null);
  const [emails, setEmails] = useState<{ [key: number]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getTDDCycles = new PortGetTDDCycles(port);
  const commitHistoryAdapter = new CommitHistoryAdapter();

  const fetchData = async () => {
    setLoading(true);
    try {
      const commits = await getTDDCycles.obtainCommitsOfRepo(repoOwner, repoName);
      setCommitsInfo(commits);

      const tddCycles = await getTDDCycles.obtainCommitTddCycle(repoOwner, repoName);
      setCommitsTddCycles(tddCycles);

      const complexityList = await getTDDCycles.obtainComplexityData(repoOwner, repoName);
      setComplexity(complexityList);
    } catch (error) {
      console.error("Error obtaining data:", error);
    } finally {
      setLoading(false);
    }
  };

  const obtainComments = async () => {
    try {
      const commentsData: CommentDataObject[] = await commentsRepo.getCommentsBySubmissionId(submissionIdcomments);
      const emailMap: { [key: number]: string } = {};
      for (const comment of commentsData) {
        try {
          const email = await getUserEmailById(comment.teacher_id);
          emailMap[comment.teacher_id] = email;
        } catch {
          emailMap[comment.teacher_id] = "Correo no disponible";
        }
      }
      setEmails(emailMap);
      setComments(commentsData);
    } catch (error) {
      console.error("Error obtaining comments:", error);
    }
  };

  useEffect(() => {
    obtainComments();
  }, [submissionIdcomments]);

  const handleFeedbackChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFeedback(event.target.value);
  };

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const commentData: CommentsCreationObject = {
        submission_id: submissionIdcomments,
        teacher_id,
        content: feedback,
      };


      await commentsRepo.createComment(commentData);

      setFeedback("");
      obtainComments();
    } catch (error) {
      console.error("Error al enviar la retroalimentación:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchOwnerName = async () => {
      try {
        const name = await commitHistoryAdapter.obtainUserName(repoOwner);
        setOwnerName(name);
      } catch (error) {
        console.error("Error obtaining owner name:", error);
      }
    };
    fetchOwnerName();
  }, [repoOwner]);

  useEffect(() => {
    fetchData();
  }, [repoOwner, repoName]);

  const goToPreviousStudent = () => {
    if (currentIndex > 0) {
      const previousIndex = currentIndex - 1;
      const previousSubmission: Submission = fetchedSubmissions[previousIndex];
      navigate(
        `?repoOwner=${previousSubmission.repository_link.split('/')[3]}&repoName=${previousSubmission.repository_link.split('/')[4]}&submissionId=${previousSubmission.id}&fetchedSubmissions=${encodeURIComponent(JSON.stringify(fetchedSubmissions))}`
      );
      setCurrentIndex(previousIndex);
    }
  };

  const goToNextStudent = () => {
    if (currentIndex < fetchedSubmissions.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextSubmission: Submission = fetchedSubmissions[nextIndex];
      navigate(
        `?repoOwner=${nextSubmission.repository_link.split('/')[3]}&repoName=${nextSubmission.repository_link.split('/')[4]}&submissionId=${nextSubmission.id}&fetchedSubmissions=${encodeURIComponent(JSON.stringify(fetchedSubmissions))}`
      );
      setCurrentIndex(nextIndex);
    }
  };

  const getUserEmailById = async (userId: number): Promise<string> => {
    try {
      const user = await usersRepository.getUserById(userId);
      return user.email.toString();
    } catch (error) {
      console.error("Error fetching student email:", error);
      return "";
    }
  };

  const [metric, setMetric] = useState<string | null>(null);

  return (
    <div className="container">
      <h1 data-testid="repoNameTitle">Tarea: {repoName}</h1>
      {!isStudent(role) && (
        <h1 data-testid="repoOwnerTitle">Autor: {ownerName}</h1>
      )}

      {loading && (
        <div className="mainInfoContainer">
          <PropagateLoader data-testid="loading-spinner" color="#36d7b7" />
        </div>
      )}

      {!loading && !commitsInfo?.length && (
        <div className="error-message" data-testid="errorMessage">
          Hubo un problema al cargar los commits del repositorio
        </div>
      )}

      {!loading && commitsInfo?.length !== 0 && (
        <React.Fragment>
          {!isStudent(role) && (
            <div className="navigation-buttons">
              <button
                data-testid="previous-student"
                className="nav-button"
                onClick={() => {
                  localStorage.setItem("selectedMetric", DefaultItem);
                  goToPreviousStudent();
                }}
                disabled={currentIndex === 0}
                style={{
                  backgroundColor: currentIndex === 0 ? "#B0B0B0" : "#052845",
                }}
              >
                Anterior
              </button>
              <button
                data-testid="next-student"
                className="nav-button"
                onClick={() => {
                  localStorage.setItem("selectedMetric", DefaultItem);
                  goToNextStudent();
                }}
                disabled={currentIndex === fetchedSubmissions.length - 1}
                style={{
                  backgroundColor:
                    currentIndex === fetchedSubmissions.length - 1
                      ? "#B0B0B0"
                      : "#052845",
                }}
              >
                Siguiente
              </button>
            </div>
          )}
          <div className="mainInfoContainer">
            <TDDCharts
              data-testId="cycle-chart"
              commits={commitsInfo}
              complexity={complexity}
              commitsTddCycles={commitsTddCycles}
              port={port}
              role={role}
              metric={metric}
              setMetric={setMetric}
              typegraphs={graphs}
            />
          </div>
        </React.Fragment>
      )}
      {role !== "student" && (
        <div className="feedback-container">
          <h2 className="comments-title">Escribe un comentario:</h2>
          <textarea
            id="feedback"
            value={feedback}
            onChange={handleFeedbackChange}
            placeholder="Ingrese su retroalimentación aquí"
          />
          <button
            onClick={handleSubmitFeedback}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <PropagateLoader color="#fff" size={5} />
            ) : (
              "Enviar"
            )}
          </button>
        </div>
      )}
      {!loading && comments && comments.length > 0 && (
        <div className="comments-section">
          <h2 className="comments-title">Comentarios</h2>
          <div className="comments-list">
            {comments.map((comment, index) => (
              <div key={index} className="comment-card">
                <div className="comment-header">
                  <strong className="comment-author">
                    {emails[comment.teacher_id] || "Cargando..."}
                  </strong>
                  <span className="comment-date">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="comment-body">
                  <p>{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TDDChartPage;