import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import GestionTareas from "./application/views/assignmentsViews/components/assignmentManager";
import AssignmentDetail from "./application/views/assignmentDetailView/components/assignmentDetail";
import {GithubAPIAdapter} from "./TDDCycles-Visualization/repository/GithubAPIAdapter";//Revisar el cambio por puerto
import TDDChartPage from "./sections/TDDCycles-Visualization/TDDChartPage";

function App() {
  return (
    <Router>
      Root Component Renders
      <Routes>
        <Route path="/" element={<GestionTareas />} />
        <Route path="/assignment/:id" element={<AssignmentDetail />} />
        <Route
          path="/graph"
          element={<TDDChartPage port={new GithubAPIAdapter()} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
