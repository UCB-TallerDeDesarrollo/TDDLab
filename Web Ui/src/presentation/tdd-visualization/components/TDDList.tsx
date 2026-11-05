import { useSearchParams } from "react-router-dom";
import type { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import type { GitGraphCommit } from "../../../modules/TDDCycles-Visualization/domain/TDDLogInterfaces";
import TDDCycleList from "./TDDCycleList";

interface CycleReportViewProps {
  commitsInfo: CommitDataObject[];
  gitGraph?: GitGraphCommit[];
}

function TDDList({ commitsInfo, gitGraph }: Readonly<CycleReportViewProps>) {
  const [searchParams] = useSearchParams();
  const repoOwner = searchParams.get("repoOwner") ?? "";
  const repoName = searchParams.get("repoName") ?? "";
  const repoUrl = repoOwner && repoName
    ? `https://github.com/${encodeURIComponent(repoOwner)}/${encodeURIComponent(repoName)}`
    : undefined;

  return (
    <div style={{ marginTop: "30px" }}>
      {commitsInfo.length === 0 && !gitGraph?.length ? (
        <div className="error-message" data-testid="errorMessage">
          No se pudo cargar la información
        </div>
      ) : (
        <TDDCycleList commitsInfo={commitsInfo} gitGraph={gitGraph} repoUrl={repoUrl} />
      )}
    </div>
  );
}

export default TDDList;
