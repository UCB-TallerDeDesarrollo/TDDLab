import React, { useEffect, useState } from "react";
import { PortGetTDDCycles } from "../../modules/TDDCycles-Visualization/application/GetTDDCycles";
import TDDCharts from "./components/TDDChart";
import TDDCycleList from "./components/TDDCycleList";
import { JobDataObject } from "../../modules/TDDCycles-Visualization/domain/jobInterfaces";
import { CommitDataObject } from "../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import "./styles/TDDChartPageStyles.css";
import { useSearchParams } from "react-router-dom";
import { PropagateLoader } from "react-spinners";
import { GithubAPIRepository } from "../../modules/TDDCycles-Visualization/domain/GithubAPIRepositoryInterface";

interface CycleReportViewProps {
  port: GithubAPIRepository;
}

function TDDChartPage({ port }: Readonly<CycleReportViewProps>) {
  const [searchParams] = useSearchParams();
  const repoOwner: string = String(searchParams.get("repoOwner"));
  const repoName: string = String(searchParams.get("repoName"));
  const [commitsInfo, setCommitsInfo] = useState<CommitDataObject[] | null>(
    null
  );
  const [jobsByCommit, setJobsByCommit] = useState<JobDataObject[] | null>(
    null
  );

  const [showCycleList, setShowCycleList] = useState(true);

  const handleSwitchButtonClick = () => {
    setShowCycleList(!showCycleList);
  };
  const [loading, setLoading] = useState(true);

  const getTDDCycles = new PortGetTDDCycles(port);

  const obtainJobsData = async () => {
    try {
      console.log("Fetching commits data...");
      const jobsData: JobDataObject[] = await getTDDCycles.obtainJobsData(
        repoOwner,
        repoName
      );
      setJobsByCommit(jobsData);
    } catch (error) {
      console.error("Error obtaining jobs:", error);
    }
  };

  const obtainCommitsData = async () => {
    console.log("Fetching commit information...");
    try {
      const commits: CommitDataObject[] =
        await getTDDCycles.obtainCommitsOfRepo(repoOwner, repoName);

      setCommitsInfo(commits);
    } catch (error) {
      console.error("Error obtaining commit information:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([obtainJobsData(), obtainCommitsData()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="container">
      <h1 data-testid="repoTitle">Repository: {repoName}</h1>

      {loading && (
        <div className="mainInfoContainer">
          <PropagateLoader data-testid="loading-spinner" color="#36d7b7" />
        </div>
      )}

      {!loading && (!commitsInfo?.length || !jobsByCommit?.length) && (
        <div className=" error-message" data-testid="errorMessage">
          No se pudo cargar la Informacion
        </div>
      )}

      {!loading && commitsInfo?.length != 0 && jobsByCommit?.length != 0 && (
        <React.Fragment>
          <div className="center-content">
            <button className="myButton" onClick={handleSwitchButtonClick}>
              Switch Chart View
            </button>
          </div>
          <div className="mainInfoContainer">
            {showCycleList ? (
              <TDDCycleList
                commitsInfo={commitsInfo}
                jobsByCommit={jobsByCommit}
              />
            ) : (
              <TDDCharts commits={commitsInfo} jobsByCommit={jobsByCommit} />
            )}
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

export default TDDChartPage;
