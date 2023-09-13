// src/App.tsx
import {useEffect,useState} from "react"
import { TDDCyclesPort } from "../useCases/tddCycles.port";
import { CommitDataObject } from "../../../../domain/models/githubInterfaces";
function CycleReportView() {
  const port=new TDDCyclesPort()
  const [commits,setCommits]=useState<CommitDataObject[]|null>(null)
  useEffect(() => {
    const APICalls = async () => {
      try {
        const data = await port.obtainCommitsOfRepo('DaddyLipi', 'Cactus-Topia');
        setCommits(data);
      } catch (error) {
        // Handle API call errors here
        console.error('Error obtaining commits:', error);
      }
    };

    APICalls();
  }, []);
  
  return (
    <>
      Grafica TDD
      {commits && JSON.stringify(commits[0])}
    </>
  );
}

export default CycleReportView;
