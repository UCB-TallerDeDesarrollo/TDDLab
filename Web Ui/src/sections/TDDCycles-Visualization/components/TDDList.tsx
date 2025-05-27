import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PropagateLoader } from "react-spinners";
import { CommitHistoryRepository } from "../../../modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterface";
import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { PortGetTDDCycles } from "../../../modules/TDDCycles-Visualization/application/GetTDDCycles";
import TDDCycleList from "./TDDCycleList";

interface CycleReportViewProps {
  port: CommitHistoryRepository;
}

function TDDList({ port }: Readonly<CycleReportViewProps>) {
  const [searchParams] = useSearchParams();
  const repoOwner: string = String(searchParams.get("repoOwner"));
  const repoName: string = String(searchParams.get("repoName"));
  const [commitsInfo, setCommitsInfo] = useState<CommitDataObject[]>([]);
  const [loading, setLoading] = useState(true);

  const getTDDCycles = new PortGetTDDCycles(port);

  const fetchData = async () => {
    try {
      console.log("Fetching commit information...");
      const commits: CommitDataObject[] = await getTDDCycles.obtainCommitsOfRepo(repoOwner, repoName);
      setCommitsInfo(commits);
      console.log("Página TDDList: ", commits);
    } catch (error) {
      console.error("Error obtaining data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div style={{ marginTop: "30px" }}>
      {loading ? (
        <div className="mainInfoContainer">
          <PropagateLoader data-testid="loading-spinner" color="#36d7b7" />
        </div>
      ) : (
        <>
          {commitsInfo.length === 0 ? (
            <div className="error-message" data-testid="errorMessage">
              No se pudo cargar la información
            </div>
          ) : (
            <div style={{ width: "100%" }}>
              <TDDCycleList commitsInfo={commitsInfo} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default TDDList;