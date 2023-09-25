import CycleReportView from "./application/views/CycleReportView/components/CycleReportView";
import { TDDCyclesPort } from "./application/views/CycleReportView/useCases/tddCycles.port";
import LinesChart from "./application/views/ChartsView/components/LineChart";
import BarsChart
 from "./application/views/ChartsView/components/BarChart";
function App() {
  return (
    <div>
      <div></div>
      <h1>TDDLAB</h1>
      <div>cards Example</div>

      <CycleReportView port={new TDDCyclesPort()}></CycleReportView>

      <div>Line Chart</div>
      <LinesChart />

      <div>Bar Chart</div>
      <BarsChart />

    </div>
  );
}

export default App;
