import CycleReportView from "./sections/TDD-Visualization/CycleReportView";
import { GetTDDCycles } from "./TDD-Visualization/application/GetTDDCycles";
function App() {
  return (
    <div>
      <div></div>
      <h1>TDDLAB</h1>
      <div>cards Example</div>

      <CycleReportView port={new GetTDDCycles()}></CycleReportView>
    </div>
  );
}

export default App;
