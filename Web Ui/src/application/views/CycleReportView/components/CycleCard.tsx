import { CommitDataObject } from "../../../../domain/models/githubCommitInterfaces";
import { JobDataObject } from "../../../../domain/models/jobInterfaces";
import "../styles/cycleCard.css"
interface CycleReportViewProps {
    commit: CommitDataObject;
    jobs: JobDataObject | null;
  }
  
function CycleCard({commit,jobs}:CycleReportViewProps) {
  const getBoxStyle = (conclusion: string) => {
    if (conclusion === 'success') {
      return { backgroundColor: 'green',width:"150px" };
    } else {
      return { backgroundColor: 'red',width:"150px" };
    }
   
  };

  function getCommitLink() {
    console.log(commit.url)
    const htmlUrl = commit.html_url;
    console.log(htmlUrl);
    return (
      <div></div>
    );
  }

  return (
    <div className="cycleCardContainer">
      <span>Commit {commit.commit.message}</span>
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


export default CycleCard;
