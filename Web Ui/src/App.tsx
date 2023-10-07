import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import GestionTareas from "./application/views/assignmentsViews/components/assignmentManager";
import AssignmentDetail from "./application/views/assignmentDetailView/components/assignmentDetail";
import CycleReportView from "./application/views/CycleReportView/components/CycleReportView";
import {GithubAPIAdapter} from "./TDDCycles-Visualization/repository/GithubAPIAdapter";//Revisar el cambio por puerto
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
          element={<CycleReportView port={new GithubAPIAdapter()} />}
        />
        <Route
          path="/bar"
          element={<ChartsView port={new GithubAPIAdapter()} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
