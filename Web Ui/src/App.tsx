import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import GestionTareas from "./sections/Assignments/AssignmentsPage";
import AssignmentDetail from "./sections/Assignments/AssignmentDetail";
import {GithubAPIAdapter} from "./TDDCycles-Visualization/repository/GithubAPIAdapter";//Revisar el cambio por puerto
import TDDChartPage from "./sections/TDDCycles-Visualization/TDDChartPage";

function App() {
  return (
    <Router>
      
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
