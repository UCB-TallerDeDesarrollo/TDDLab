// src/App.tsx
import {useEffect,useState} from "react"
import { TDDCyclesPort } from "../useCases/tddCycles.port";
import { CommitDataObject } from "../../../../domain/models/githubInterfaces";
import CycleCard from "./CycleCard";
function CycleReportView() {
  const port=new TDDCyclesPort()
  const [commits,setCommits]=useState<CommitDataObject[]|null>(null)
  const repoOwner="DwijanX";
  const repoName="Bulls-and-Cows"
  useEffect(() => {
    const APICalls = async () => {
      try {
        const data = await port.obtainCommitsOfRepo(repoOwner, repoName);
        setCommits(data);
      } catch (error) {
        console.error('Error obtaining commits:', error);
      }
    };

    APICalls();
  }, []);
  
  return (
    <>
      <h1>Repository:{repoName} </h1>
      {commits && commits.map((commit) => (
          <CycleCard key={commit.sha} commit={commit}></CycleCard>
        ))}
    </>
  );
}

export default CycleReportView;
