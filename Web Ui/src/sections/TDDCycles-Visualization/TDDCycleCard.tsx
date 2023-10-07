import { CommitInformationDataObject } from "../../TDDCycles-Visualization/domain/githubCommitInterfaces";
import { JobDataObject } from "../../TDDCycles-Visualization/domain/jobInterfaces";
import "../../assets/styles/TDDCycleCard.css"

interface CycleReportViewProps {
    commit: CommitInformationDataObject;
    jobs: JobDataObject | null;
  }
  
function TDDCycleCard({commit,jobs}:CycleReportViewProps) {
  const getBoxStyle = (conclusion: string) => {
    if (conclusion === 'success') {
      return { backgroundColor: 'green',width:"150px" };
    } else {
      return { backgroundColor: 'red',width:"150px" };
    }
   
  };

  function getCommitLink() {
    console.log(commit)
    const htmlUrl = commit.html_url;
    return (
      <a href={htmlUrl} target="_blank" rel="noopener noreferrer" className="commit-link">
      Ver commit
    </a>
    );
  }

  function getCommitStats() {
    return (
      <div className="commit-stats">
        Total: {commit.stats.total} <br/>
        Adiciones: {commit.stats.additions} <br/>
        Sustraccion: {commit.stats.deletions} <br/>
      </div>
    );    
  }

  return (
    <div className="cycleCardContainer">
      <span>Commit {commit.commit.message}</span>
      {getCommitStats()}
      {jobs!=null && 
        <div className={"conclusionBox"} style={getBoxStyle(jobs.jobs[0].conclusion)}>
          Actions:{jobs.jobs[0].conclusion}
        </div>
       }
      {jobs==null && 
        <div className={"conclusionBox noActionsBox"} >
          Actions werent Found
        </div>
       }
       {getCommitLink()}
        
      <br />    
    </div>

  );
}


export default TDDCycleCard;
