import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import GestionTareas from "./sections/Assignments/AssignmentsPage";
import AssignmentDetail from "./sections/Assignments/AssignmentDetail";
import { GithubAPIAdapter } from "./modules/TDDCycles-Visualization/repository/GithubAPIAdapter"; //Revisar el cambio por puerto
import TDDChartPage from "./sections/TDDCycles-Visualization/TDDChartPage";
import Login from "./sections/Login/LoginPage";
import Groups from "./sections/Groups/GroupsPage";
import User from "./sections/User/UserPage";
import Navbar from "./sections/Navbar/Navbar";
import GroupsIcon from "@mui/icons-material/Groups";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonIcon from "@mui/icons-material/Person";

const navArrayLinks = [
  {
    title: "Grupos",
    path: "/groups",
    icon: <GroupsIcon />,
  },
  {
    title: "Tareas",
    path: "/",
    icon: <DescriptionIcon />,
  },
  {
    title: "Usuario",
    path: "/user",
    icon: <PersonIcon />,
  },
  
];


function App() {
  return (
        <Router>
          <Navbar navArrayLinks={navArrayLinks} />
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
  );
}

export default App;
