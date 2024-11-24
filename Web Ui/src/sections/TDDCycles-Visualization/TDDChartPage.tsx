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
import { ComplexityObject } from "../../modules/TDDCycles-Visualization/domain/complexityInferface";

interface CycleReportViewProps {
  port: GithubAPIRepository;
  role: string;
}

interface Submission {
  id: number;
  repository_link: string;
}

function isStudent(role: string) {
  return role === "student";
}

function TDDChartPage({ port, role }: Readonly<CycleReportViewProps>) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const repoOwner: string = String(searchParams.get("repoOwner")) || "defaultOwner";
  const repoName: string = String(searchParams.get("repoName")) || "defaultRepo";

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
  const [complexityInfo, setComplexity] = useState<ComplexityObject[] | null>(null);
  const [jobsByCommit, setJobsByCommit] = useState<JobDataObject[] | null>(null);
  const [loading, setLoading] = useState(true);

  const getTDDCycles = new PortGetTDDCycles(port);
  const githubAPIAdapter = new GithubAPIAdapter();

  const fetchData = async () => {
    setLoading(true);
    try {
      const jobsData = await getTDDCycles.obtainJobsData(repoOwner, repoName);
      const commits = await getTDDCycles.obtainCommitsOfRepo(repoOwner, repoName);
      const complexity1 = await getTDDCycles.obtainComplexityData(repoOwner,repoName);
      console.log(complexity1);
      setJobsByCommit(jobsData);
      setComplexity(complexity1);
      setCommitsInfo(commits);
    } catch (error) {
      console.error("Error obtaining data:", error);
    } finally {
      setLoading(false);
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
              complexity = {complexityInfo}
              port={port}
              role={role}
              metric={metric}
              setMetric={setMetric}
            />
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

export default TDDChartPage;