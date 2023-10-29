import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import GestionTareas from "./sections/Assignments/AssignmentsPage";
import AssignmentDetail from "./sections/Assignments/AssignmentDetail";
import { GithubAPIAdapter } from "./modules/TDDCycles-Visualization/repository/GithubAPIAdapter"; //Revisar el cambio por puerto
import TDDChartPage from "./sections/TDDCycles-Visualization/TDDChartPage";
import Login from "./sections/Assignments/LoginPage";
import Groups from "./sections/Assignments/GroupsPage";
import User from "./sections/Assignments/UserPage";
import Navbar from "./sections/Assignments/components/Navbar";


function App() {
  return (
    <>
     <Navbar/>
          <Router>
            <Routes>
              <Route path="/" element={<GestionTareas />} />
              <Route path="/assignment/:id" element={<AssignmentDetail />} />
              <Route path="/login" element={<Login/>} />
              <Route path="/groups" element={<Groups/>} />
              <Route path="/user" element={<User/>} />
              <Route
                path="/graph"
                element={<TDDChartPage port={new GithubAPIAdapter()} />}
              />
            </Routes>
          </Router>
    </>
  );
}

export default App;
