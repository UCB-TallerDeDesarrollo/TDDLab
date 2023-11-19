import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import GestionTareas from "./sections/Assignments/AssignmentsPage";
import AssignmentDetail from "./sections/Assignments/AssignmentDetail";
import { GithubAPIAdapter } from "./modules/TDDCycles-Visualization/repository/GithubAPIAdapter"; //Revisar el cambio por puerto
import TDDChartPage from "./sections/TDDCycles-Visualization/TDDChartPage";
import Login from "./sections/Login/LoginPage";
import Groups from "./sections/Groups/GroupsPage";
import User from "./sections/User/UserPage";
import MainMenu from "./sections/MainMenu/MainMenu";
import GroupsIcon from "@mui/icons-material/Groups";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonIcon from "@mui/icons-material/Person";
import AuthComponent from "./sections/Invitation/InvitationPage";
import { useEffect } from "react";
import { setGlobalState } from "./modules/Auth/domain/authStates";
import { getSessionCookie } from "./modules/Auth/application/setSessionCookie";

import { useGlobalState } from "./modules/Auth/domain/authStates";
import "./App.css";
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
    title: "Usuarios",
    path: "/user",
    icon: <PersonIcon />,
  },
];

function App() {
  useEffect(() => {
    console.log("entrando a sessionCookie");
    const storedSession = getSessionCookie();
    if (storedSession) {
      setGlobalState('authData', {
        userProfilePic: storedSession.photoURL,
        userEmail: storedSession.email,
        userCourse: storedSession.course,
      });
    }
  }, []);
  const authData = useGlobalState("authData")[0];
  return (
    <Router>
      {authData.userEmail != "" && <MainMenu navArrayLinks={navArrayLinks} />}
      <Routes>
        <Route path="/" element={<GestionTareas />} />
        <Route path="/assignment/:id" element={<AssignmentDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/user" element={<User />} />
        <Route
          path="/graph"
          element={<TDDChartPage port={new GithubAPIAdapter()} />}
        />
        <Route path="/invitation" element={<AuthComponent />} />
      </Routes>
    </Router>
  );
}

export default App;
