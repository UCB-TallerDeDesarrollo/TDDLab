import CycleReportView from "./TDD-Visualization/application/views/CycleReportView/components/CycleReportView";
import { TDDCyclesPort } from "./TDD-Visualization/application/views/CycleReportView/useCases/tddCycles.port";
function App() {
  return (
    <div>
      <div></div>
      <h1>TDDLAB</h1>
      <div>cards Example</div>

      <CycleReportView port={new TDDCyclesPort()}></CycleReportView>
    </div>
  );
}

export default App;
