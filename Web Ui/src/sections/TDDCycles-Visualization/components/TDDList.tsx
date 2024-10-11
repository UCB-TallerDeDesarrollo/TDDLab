import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PropagateLoader } from "react-spinners";
import { GithubAPIRepository } from "../../../modules/TDDCycles-Visualization/domain/GithubAPIRepositoryInterface";
import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { JobDataObject } from "../../../modules/TDDCycles-Visualization/domain/jobInterfaces";
import { PortGetTDDCycles } from "../../../modules/TDDCycles-Visualization/application/GetTDDCycles";
import TDDCycleList from "./TDDCycleList";

interface CycleReportViewProps {
  port: GithubAPIRepository;
}

function TDDList({ port }: Readonly<CycleReportViewProps>) {
  const [searchParams] = useSearchParams();
  const repoOwner: string = String(searchParams.get("repoOwner"));
  const repoName: string = String(searchParams.get("repoName"));
  const [commitsInfo, setCommitsInfo] = useState<CommitDataObject[] | null>(
    null
  );
  const [jobsByCommit, setJobsByCommit] = useState<JobDataObject[] | null>(
    null
  );

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
      console.log("Página TDDList: ");
      console.log(commitsInfo);
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
    <div
      style={{
        marginTop: "20px",
        marginRight: "30px",
      }}
    >
      {loading && (
        <div className="mainInfoContainer">
          <PropagateLoader data-testid="loading-spinner" color="#36d7b7" />
        </div>
      )}

      {!loading && !commitsInfo?.length && (
        <div className=" error-message" data-testid="errorMessage">
          No se pudo cargar la Informacion
        </div>
      )}

      {!loading && commitsInfo?.length != 0 && (
        <div style={{ width: "100%" }}>
          <TDDCycleList
            commitsInfo={commitsInfo}
            jobsByCommit={jobsByCommit}
          ></TDDCycleList>
        </div>
      )}
    </div>
  );
}

export default TDDList;
