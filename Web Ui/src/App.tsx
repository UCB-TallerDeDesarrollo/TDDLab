import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import GestionTareas from "./application/views/assignmentsViews/components/assignmentManager";
import AssignmentDetail from "./application/views/assignmentDetailView/components/assignmentDetail";
import CycleReportView from "./application/views/CycleReportView/components/CycleReportView";
import { TDDCyclesPort } from "./application/views/CycleReportView/useCases/tddCycles.port";
import ChartsView from "./application/views/CycleReportView/components/ChartsView";

function App() {
  return (
    <Router>
      Root Component Renders
      <Routes>
        <Route path="/" element={<GestionTareas />} />
        <Route path="/assignment/:id" element={<AssignmentDetail />} />
        <Route
          path="/graph"
          element={<CycleReportView port={new TDDCyclesPort()} />}
        />
        <Route
          path="/bar"
          element={<ChartsView port={new TDDCyclesPort()} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
