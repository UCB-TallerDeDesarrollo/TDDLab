import CycleReportView from "./application/views/CycleReportView/components/CycleReportView";
import { TDDCyclesPort } from "./application/views/CycleReportView/useCases/tddCycles.port";
import LinesChart from "./application/views/LineChartView/components/LineChart";

function App() {
  return (
    <div>
      <div></div>
      <h1>TDDLAB</h1>
      <div>cards Example</div>

      <CycleReportView port={new TDDCyclesPort()}></CycleReportView>

      <div>Line Chart</div>
      <LinesChart />

    </div>
  );
}

export default App;
