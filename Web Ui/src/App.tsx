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
import InvitationPage from "./sections/Invitation/InvitationPage";
import { useEffect } from "react";
import {
  setGlobalState,
  useGlobalState,
} from "./modules/User-Authentication/domain/authStates";
import { getSessionCookie } from "./modules/User-Authentication/application/getSessionCookie";
import "./App.css";
import ProtectedRouteComponent from "./ProtectedRoute";
const navArrayLinks = [
  {
    title: "Grupos",
    path: "/groups",
    icon: <GroupsIcon />,
    access: ["admin"],
  },
  {
    title: "Tareas",
    path: "/",
    icon: <DescriptionIcon />,
    access: ["admin","student"],
  },
  {
    title: "Usuarios",
    path: "/user",
    icon: <PersonIcon />,
    access: ["admin","student"],
  },
];

function App() {
  useEffect(() => {
    const storedSession = getSessionCookie();
    if (storedSession) {
      setGlobalState("authData", {
        userProfilePic: storedSession.userData.photoURL,
        userEmail: storedSession.userData.email,
        userCourse: storedSession.course,
        userRole: storedSession.role,
      });
    } else {
      setGlobalState("authData", {
        userProfilePic: "",
        userEmail: "",
        userCourse: "",
        userRole: "",
      });
    }
  }, []);
  const authData = useGlobalState("authData")[0];
  return (
    <Router>
      {authData.userEmail != "" && authData.userRole !== undefined && <MainMenu navArrayLinks={navArrayLinks} userRole={authData.userRole} />}
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRouteComponent>
              <GestionTareas userRole={authData.userRole?? ""}/>
            </ProtectedRouteComponent>
          }
        />
        <Route
          path="/assignment/:id"
          element={
            <ProtectedRouteComponent>
              <AssignmentDetail />
            </ProtectedRouteComponent>
          }
        />

        <Route path="/login" element={<Login />} />

        <Route
          path="/groups"
          element={
            <ProtectedRouteComponent>
              <Groups />
            </ProtectedRouteComponent>
          }
        />
        <Route
          path="/user"
          element={
            <ProtectedRouteComponent>
              <User />
            </ProtectedRouteComponent>
          }
        />
        <Route
          path="/graph"
          element={
            <ProtectedRouteComponent>
              <TDDChartPage port={new GithubAPIAdapter()} />
            </ProtectedRouteComponent>
          }
        />
        <Route path="/invitation" element={<InvitationPage />} />
      </Routes>
    </Router>
  );
}

export default App;
