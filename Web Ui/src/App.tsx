import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import GestionTareas from "./application/views/assignmentsViews/components/assignmentManager";
import AssignmentDetail from "./application/views/assignmentDetailView/components/assignmentDetail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/TDDLab/" element={<GestionTareas />} />
        <Route path="/TDDLab/:id" element={<AssignmentDetail id={1} />} />



      </Routes>
    </Router>
  );
}

export default App;
