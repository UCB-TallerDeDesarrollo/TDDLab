import CycleReportView from "./application/views/CycleReportView/components/CycleReportView";
import { TDDCyclesPort } from "./application/views/CycleReportView/useCases/tddCycles.port";
import GestionTareas from "./application/views/assignmentsViews/components/assignmentManager";

function App() {
  return (
    <div>
      <div></div>
      <GestionTareas />
      
     {/* <CycleReportView port={new TDDCyclesPort()}></CycleReportView>*/}
    </div>
  );
}

export default App;
