import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import GestionTareas from "./application/views/assignmentsViews/components/assignmentManager";
import AssignmentDetail from "./application/views/assignmentDetailView/components/assignmentDetail";
import CycleReportView from "./application/views/CycleReportView/components/CycleReportView";
import { TDDCyclesPort } from "./application/views/CycleReportView/useCases/tddCycles.port";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GestionTareas />} />
        <Route path="/assignment/:id" element={<AssignmentDetail id={1} />} />
        <Route path="/graph" element={<CycleReportView port={new TDDCyclesPort()} />} />


      </Routes>
    </Router>
  );
}

export default App;
