import { CommitDataObject } from "../../TDD-Visualization/domain/models/githubCommitInterfaces";
import { JobDataObject } from "../../TDD-Visualization/domain/models/jobInterfaces";
import "../../assets/styles/cycleCard.css";
interface CycleReportViewProps {
  commit: CommitDataObject;
  jobs: JobDataObject | null;
}

function CycleCard({ commit, jobs }: CycleReportViewProps) {
  const getBoxStyle = (conclusion: string) => {
    if (conclusion === "success") {
      return { backgroundColor: "green", width: "150px" };
    } else {
      return { backgroundColor: "red", width: "150px" };
    }
  };

  function getCommitLink() {
    console.log(commit);
    const htmlUrl = commit.html_url;
    return (
      <a
        href={htmlUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="commit-link"
      >
        Ver commit
      </a>
    );
  }

  return (
    <div className="cycleCardContainer">
      <span>Commit {commit.commit.message}</span>
      {jobs != null && (
        <div
          className={"conclusionBox"}
          style={getBoxStyle(jobs.jobs[0].conclusion)}
        >
          Actions:{jobs.jobs[0].conclusion}
        </div>
      )}
      {jobs == null && (
        <div className={"conclusionBox noActionsBox"}>Actions werent Found</div>
      )}
      {getCommitLink()}
      <br />
    </div>
  );
}

export default CycleCard;
