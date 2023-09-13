// src/App.tsx
import { CommitDataObject } from "../../../../domain/models/githubInterfaces";
interface CycleReportViewProps {
    commit: CommitDataObject;
  }
  
function CycleCard({commit}:CycleReportViewProps) {
  
  
  return (
    <>
      <span>Commit {commit.commit.message}</span>
      <br />    

    </>
  );
}

export default CycleCard;
