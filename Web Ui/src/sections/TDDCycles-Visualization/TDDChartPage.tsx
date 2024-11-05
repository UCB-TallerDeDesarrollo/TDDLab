import React, { useEffect, useState } from "react";
import { PortGetTDDCycles } from "../../modules/TDDCycles-Visualization/application/GetTDDCycles";
import TDDCharts from "./components/TDDChart";
import { JobDataObject } from "../../modules/TDDCycles-Visualization/domain/jobInterfaces";
import { CommitDataObject } from "../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import "./styles/TDDChartPageStyles.css";
import { useSearchParams } from "react-router-dom";
import { PropagateLoader } from "react-spinners";
import { GithubAPIRepository } from "../../modules/TDDCycles-Visualization/domain/GithubAPIRepositoryInterface";
import { GithubAPIAdapter } from "../../modules/TDDCycles-Visualization/repository/GithubAPIAdapter";

interface CycleReportViewProps {
  port: GithubAPIRepository;
  role: string;
  metricSe:string | null;
}

function isStudent(role: string) {
  return role === "student";
}

function TDDChartPage({ port, role,metricSe}: Readonly<CycleReportViewProps>) {
  const [searchParams] = useSearchParams();
  const repoOwner: string = String(searchParams.get("repoOwner"));
  const repoName: string = String(searchParams.get("repoName"));
  
  const [ownerName, setOwnerName] = useState<string>("");
  const [commitsInfo, setCommitsInfo] = useState<CommitDataObject[] | null>(null);
  const [jobsByCommit, setJobsByCommit] = useState<JobDataObject[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState<string | null>(null); // Estado para manejar la métrica seleccionada

  const getTDDCycles = new PortGetTDDCycles(port);
  const githubAPIAdapter = new GithubAPIAdapter();

  const fetchOwnerName = async () => {
    try {
      const name = await githubAPIAdapter.obtainUserName(repoOwner);
      setOwnerName(name);
    } catch (error) {
      console.error("Error obtaining owner name:", error);
    }
  };

  const fetchJobsData = async () => {
    try {
      const jobsData: JobDataObject[] = await getTDDCycles.obtainJobsData(repoOwner, repoName);
      setJobsByCommit(jobsData);
    } catch (error) {
      console.error("Error obtaining jobs:", error);
    }
  };

  const fetchCommitsData = async () => {
    try {
      const commits: CommitDataObject[] = await getTDDCycles.obtainCommitsOfRepo(repoOwner, repoName);
      setCommitsInfo(commits);
    } catch (error) {
      console.error("Error obtaining commit information:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchOwnerName(), fetchJobsData(), fetchCommitsData()]);
      setLoading(false);
    };
    fetchData();
  }, [repoOwner, repoName]);

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
        <div className="mainInfoContainer">
          <TDDCharts
            data-testId="cycle-chart"
            commits={commitsInfo}
            jobsByCommit={jobsByCommit}
            metric={metric} // Pasamos el estado metric
            setMetric={setMetric}
            port={port}
            role={role}
             // Pasamos la función para actualizar la métrica
          />
        </div>
      )}
    </div>
  );
}

export default TDDChartPage;
