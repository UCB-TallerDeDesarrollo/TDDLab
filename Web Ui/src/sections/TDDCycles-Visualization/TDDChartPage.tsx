import React, { useEffect, useState } from "react";
import { PortGetTDDCycles } from "../../modules/TDDCycles-Visualization/application/GetTDDCycles";
import TDDCharts from "./components/TDDChart";
import { JobDataObject } from "../../modules/TDDCycles-Visualization/domain/jobInterfaces";
import { CommitDataObject } from "../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import "./styles/TDDChartPageStyles.css";
import { useSearchParams, useNavigate } from "react-router-dom";
import { PropagateLoader } from "react-spinners";
import { GithubAPIRepository } from "../../modules/TDDCycles-Visualization/domain/GithubAPIRepositoryInterface";
import { GithubAPIAdapter } from "../../modules/TDDCycles-Visualization/repository/GithubAPIAdapter";
import TeacherCommentsRepository from "../../modules/teacherCommentsOnSubmissions/repository/CommentsRepository";
import { CommentDataObject,CommentsCreationObject } from "../../modules/teacherCommentsOnSubmissions/domain/CommentsInterface";

interface CycleReportViewProps {
  port: GithubAPIRepository;
  role: string;
  teacher_id: number;
}

interface Submission {
  id: number;
  repository_link: string;
}

function isStudent(role: string) {
  return role === "student";
}

function TDDChartPage({ port, role, teacher_id }: Readonly<CycleReportViewProps>) {
  
  const [searchParams] = useSearchParams();
  const commentsRepo = new TeacherCommentsRepository();
  const navigate = useNavigate();

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
  const [jobsByCommit, setJobsByCommit] = useState<JobDataObject[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<CommentDataObject[] | null>(null);
  const [feedback, setFeedback] = useState<string>("");


  const getTDDCycles = new PortGetTDDCycles(port);
  const githubAPIAdapter = new GithubAPIAdapter();

  const fetchData = async () => {
    setLoading(true);
    try {
      const jobsData = await getTDDCycles.obtainJobsData(repoOwner, repoName);
      const commits = await getTDDCycles.obtainCommitsOfRepo(repoOwner, repoName);
      setJobsByCommit(jobsData);
      setCommitsInfo(commits);
    } catch (error) {
      console.error("Error obtaining data:", error);
    } finally {
      setLoading(false);
    }
  };
  const obtainComments = async () => {
    console.log("ID delsubmission: ",submissionIdcomments)
    try {
      console.log("intentando conectar para comentarios: ")
      const commentsData: CommentDataObject[] = await commentsRepo.getCommentsBySubmissionId(submissionIdcomments);
      console.log("siguiente paso comentarios")
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
      console.log("El feedback está vacío.");
      return;
    }

    try {
      const commentData: CommentsCreationObject = {
        submission_id: submissionIdcomments,
        teacher_id,
        content: feedback,
      };
  
      console.log("Datos del comentario a enviar:", commentData); 
  
      await commentsRepo.createComment(commentData);
      console.log("Retroalimentación enviada:", feedback);
  
      setFeedback("");
      obtainComments();
    } catch (error) {
      console.error("Error al enviar la retroalimentación:", error);
    }
  };

  useEffect(() => {
    const fetchOwnerName = async () => {
      try {
        const name = await githubAPIAdapter.obtainUserName(repoOwner);
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
          No se pudo cargar la Información
        </div>
      )}

      {!loading && commitsInfo?.length !== 0 && (
        <React.Fragment>
          {!isStudent(role) && (
            <div className="navigation-buttons">
              <button
                data-testid="previous-student"
                className="nav-button"
                onClick={goToPreviousStudent}
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
                onClick={goToNextStudent}
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
              jobsByCommit={jobsByCommit}
              port={port}
              role={role}
              metric={metric}
              setMetric={setMetric}
            />
          </div>
        </React.Fragment>
      )}
      {role != "student" && (
    <div className="feedback-container">
      <label htmlFor="feedback">Retroalimentación de la tarea:</label>
      <textarea
        id="feedback"
        value={feedback}
        onChange={handleFeedbackChange}
        placeholder="Ingrese su retroalimentación aquí"
        style={{
          width: "100%",
          height: "100px",
          padding: "10px",
          marginTop: "5px",
          borderRadius: "5px",
          border: "1px solid #ccc"
        }}
      />
      <button
        onClick={handleSubmitFeedback}
        style={{
          marginTop: "10px",
          padding: "10px 20px",
          backgroundColor: "#36d7b7",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginBottom: "20px"
        }}
      >
        Enviar Retroalimentación
      </button>
    </div>
  )}
  {!loading && comments && comments.length > 0 && (
        <div className="comments-section">
          <h2>Comentarios</h2>
          <ul>
            {comments.map((comment, index) => (
              <li key={index} style={{ marginBottom: "10px", borderBottom: "1px solid #ddd" }}>
                <p><strong>Autor:</strong> {comment.teacher_id}</p>
                <p><strong>Comentario:</strong> {comment.content}</p>
                <p><strong>Fecha:</strong> {new Date(comment.created_at).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default TDDChartPage;