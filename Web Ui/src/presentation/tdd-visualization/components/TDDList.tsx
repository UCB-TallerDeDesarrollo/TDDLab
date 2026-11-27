import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PropagateLoader } from "react-spinners";
import { CommitHistoryRepository } from "../../../modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterface";
import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { GetCommitsOfRepo } from "../../../modules/TDDCycles-Visualization/application/GetCommitsOfRepo";
import TDDCycleList from "./TDDCycleList";

type CommitsState =
  | { status: "loading" }
  | { status: "empty" }
  | { status: "error" }
  | { status: "loaded"; commits: CommitDataObject[] };

interface CycleReportViewProps {
  port: CommitHistoryRepository;
  commits?: CommitDataObject[];
}

function TDDList({ port, commits }: Readonly<CycleReportViewProps>) {
  const [searchParams] = useSearchParams();
  const repoOwner = searchParams.get("repoOwner") ?? "";
  const repoName = searchParams.get("repoName") ?? "";
  const branch = searchParams.get("branch") || undefined;
  const [commitsState, setCommitsState] = useState<CommitsState>({
    status: "loading",
  });

  useEffect(() => {
    if (commits !== undefined) return;
    let isActive = true;
    setCommitsState({ status: "loading" });

    new GetCommitsOfRepo(port)
      .execute(repoOwner, repoName, branch)
      .then((commits) => {
        if (isActive) {
          setCommitsState(
            commits.length > 0
              ? { status: "loaded", commits }
              : { status: "empty" },
          );
        }
      })
      .catch((error: unknown) => {
        console.error("Error obtaining commits:", error);
        if (isActive) {
          setCommitsState({ status: "error" });
        }
      });

    return () => {
      isActive = false;
    };
  }, [port, repoOwner, repoName, branch, commits]);

  const displayState: CommitsState = commits === undefined ? commitsState
    : commits.length > 0 ? { status: "loaded", commits } : { status: "empty" };

  return (
    <div style={{ marginTop: "30px" }}>
      {displayState.status === "loading" && (
        <div className="mainInfoContainer" role="status" aria-label="Cargando commits">
          <PropagateLoader data-testid="loading-spinner" color="#36d7b7" />
        </div>
      )}
      {displayState.status === "empty" && (
        <div className="empty-message" role="status" data-testid="emptyMessage">
          No hay commits disponibles para este repositorio.
        </div>
      )}
      {displayState.status === "error" && (
        <div className="error-message" role="alert" data-testid="errorMessage">
          No se pudieron cargar los commits. Inténtalo de nuevo más tarde.
        </div>
      )}
      {displayState.status === "loaded" && (
        <div style={{ width: "100%" }}>
          <TDDCycleList commitsInfo={displayState.commits} />
        </div>
      )}
    </div>
  );
}

export default TDDList;
