import { useEffect, useState } from "react";
import { PortGetTDDCycles } from "../../TDDCycles-Visualization/application/GetTDDCycles";
import { GithubAPIAdapter } from "../../TDDCycles-Visualization/repository/GithubAPIAdapter";
import TDDChartsView from "./TDDChartsView";
import TDDCycleList from "./TDDCycleList";
import { JobDataObject } from "../../TDDCycles-Visualization/domain/jobInterfaces";
import { CommitDataObject } from "../../TDDCycles-Visualization/domain/githubCommitInterfaces";
import "./styles/TDDChartPageStyles.css"


interface CycleReportViewProps {
  port: GithubAPIAdapter | any;
}

function TDDChartPage({ port }: CycleReportViewProps) {
  const repoOwner = "DwijanX";
  const repoName = "Bulls-and-Cows";

  const [commitsInfo, setCommitsInfo] = useState<CommitDataObject[] | null>(null);
  const [jobsByCommit, setJobsByCommit] = useState<JobDataObject[] | null>(null);

  const [showCycleList, setShowCycleList] = useState(true);

  const handleSwitchButtonClick = () => {
    setShowCycleList(!showCycleList);
  };

  const getTDDCycles = new PortGetTDDCycles(port);

  const obtainJobsData = async () => {
    try {
      console.log("Fetching commits data...");
      const jobsData: JobDataObject[] = await getTDDCycles.obtainJobsData(repoOwner, repoName);
      setJobsByCommit(jobsData);
    } catch (error) {
      console.error('Error obtaining jobs:', error);
    }
  };

  const obtainCommitsData = async () => {
    console.log("Fetching commit information...");
    try {
      const commits: CommitDataObject[] = await getTDDCycles.obtainCommitsOfRepo(repoOwner, repoName);
      
      setCommitsInfo(commits);
      
    } catch (error) {
      console.error('Error obtaining commit information:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await obtainJobsData();
      await obtainCommitsData();
    };
    fetchData();
  }, []);

  return (
    <div className="container">
      <div className="center-content">
        <button className="myButton" onClick={handleSwitchButtonClick}>
          Switch Chart View
        </button>
      </div>
      {showCycleList ? (
        <div className="tdd-cycle-list">
          <h1>Repository: {repoName}</h1>
          <TDDCycleList commitsInfo={commitsInfo} jobsByCommit={jobsByCommit} />
        </div>
      ) : (
        <div className="tdd-charts-view">
          <h1>Repository: {repoName}</h1>
          <TDDChartsView commitsInfo={commitsInfo} jobsByCommit={jobsByCommit} />
        </div>
      )}
    </div>
  );
}

export default TDDChartPage;