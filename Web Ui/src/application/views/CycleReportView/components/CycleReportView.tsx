// src/App.tsx
import {useEffect} from "react"
import { TDDCyclesPort } from "../useCases/tddCycles.port";
function CycleReportView() {
  const port=new TDDCyclesPort()
  useEffect(() => {
    console.log("testing github API");
    port.obtainCommitsOfRepo("DwijanX","astronomyPage")

  }, [])
  
  return (
    <>
      Grafica TDD
    </>
  );
}

export default CycleReportView;
