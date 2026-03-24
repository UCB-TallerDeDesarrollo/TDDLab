import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import GestionTareas from "./sections/Assignments/AssignmentsPage";
import AssignmentDetail from "./sections/Assignments/AssignmentDetail";
import { CommitHistoryAdapter } from "./modules/TDDCycles-Visualization/repository/CommitHistoryAdapter"; //Revisar el cambio por puerto
import TDDChartPage from "./sections/TDDCycles-Visualization/TDDChartPage";
import Login from "./sections/Login/LoginPage";
import Groups from "./sections/Groups/GroupsPage";
import User from "./sections/User/UserPage";
import HeaderNav from "./sections/MainMenu/components/HeaderNav";
import MainMenu from "./sections/MainMenu/MainMenu";
import MainMenu_v2 from "./sections/MainMenu/MainMenu_v2";
import GroupsIcon from "@mui/icons-material/Groups";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings"; 
import HomeIcon from '@mui/icons-material/Home';
import { NoteAdd } from "@mui/icons-material";
import InvitationPage from "./sections/GroupInvitation/InvitationPage";
import { useEffect } from "react";
import {
  setGlobalState,
  useGlobalState,
} from "./modules/User-Authentication/domain/authStates";
import { getSessionCookie } from "./modules/User-Authentication/application/getSessionCookie";
import "./App.css";
import ProtectedRouteComponent from "./ProtectedRoute";
import UsersByGroupPage from "./sections/User/UserBygroupPage";
import MyPracticesPage from "./sections/MyPractices/MyPracticesPage";
import PracticeDetail from "./sections/MyPractices/PracticeDetail";
import AIAssistantPage from "./sections/AIAssistant/AIAssistantPage";
import SettingsPage from "./sections/Settings/SettingsPage";
import {
  CircularProgress,
  Box,
} from "@mui/material";
import UserProfilePage from "./sections/User/UserProfilePage";

const navArrayLinks = [
  {
    title: "Inicio",
    path: "/home",
    icon: <HomeIcon />,
    access: ["admin", "teacher", "student"], 
  },
  {
    title: "Grupos",
    path: "/groups",
    icon: <GroupsIcon />,
    access: ["admin", "teacher"],
  },
  {
    title: "Tareas",
    path: "/",
    icon: <DescriptionIcon />,
    access: ["admin", "student", "teacher"],
  },
  {
    title: "Mis Practicas",
    path: "/mis-practicas",
    icon: <NoteAdd />,
    access: ["admin", "teacher", "student"],
  },
  {
    title: "Usuarios",
    path: "/user",
    icon: <PersonIcon />,
    access: ["admin", "teacher"],
  },
  {
    title: "Configuraciones",
    path: "/configuraciones",
    icon: <SettingsIcon />,
    access: ["admin", "teacher"], 
  },
];

function App() {
  const authData = useGlobalState("authData")[0];
useEffect(() => {
  getSessionCookie().then((storedSession) => {
    const savedImage = localStorage.getItem("userProfilePic") || "";
    if (storedSession) {
      setGlobalState("authData", {
        userid: storedSession.id,
        userProfilePic: savedImage,
        userEmail: storedSession.email,
        usergroupid: storedSession.groupid,
        userRole: storedSession.role,
      });
    } else {
      setGlobalState("authData", {
        userid: -1,
        userProfilePic: savedImage,
        userEmail: "",
        usergroupid: -1,
        userRole: "",
      });
    }
  });
}, []);
  if (authData.userid === undefined) {
     return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
      }}
    >
      <CircularProgress />
    </div>
  );
  }
  return (
    <Router>
      {authData.userEmail != "" && authData.userRole !== undefined && (
        <MainMenu_v2 navArrayLinks={navArrayLinks} userRole={authData.userRole} />
      )}

      <Box sx={{ ml: authData.userEmail !== "" && authData.userRole !== undefined ? "220px" : 0 }}>
        {authData.userEmail !== "" && authData.userRole !== undefined && (
          <Box sx={{ p: 2 }}>
            <HeaderNav
              userName={authData.userEmail ?? ""}
              avatarUrl={authData.userProfilePic ?? ""}
            />
          </Box>
        )}
        <Routes>
        <Route
          path="/"
          element={
            <ProtectedRouteComponent>
              <GestionTareas
                userRole={authData.userRole ?? ""}
                userGroupid={authData.usergroupid ?? -1}
              />
            </ProtectedRouteComponent>
          }
        />
        <Route
          path="/assignment/:id"
          element={
            <ProtectedRouteComponent>
              <AssignmentDetail
                role={authData.userRole ?? ""}
                userid={authData.userid ?? -1}
              />
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
              <TDDChartPage port={new CommitHistoryAdapter()} role={authData.userRole ?? ""} teacher_id={authData.userid ?? -1} graphs="graph" />
            </ProtectedRouteComponent>
          }
        />
        <Route
          path="/aditionalgraph"
          element={
            <ProtectedRouteComponent>
              <TDDChartPage port={new CommitHistoryAdapter()} role={authData.userRole ?? ""} teacher_id={authData.userid ?? -1} graphs="aditionalgraph" />
            </ProtectedRouteComponent>
          }
        />
        <Route path="/invitation" element={<InvitationPage />} />

        <Route
          path="/mis-practicas"
          element={
            <ProtectedRouteComponent>
              <MyPracticesPage
                userRole={authData.userRole ?? ""}
                userid={authData.userid ?? 0}
              />
            </ProtectedRouteComponent>
          }
        />

        <Route
          path="/mis-practicas/:id"
          element={
            <ProtectedRouteComponent>
              <PracticeDetail userid={authData.userid ?? 0} title={""} />
            </ProtectedRouteComponent>
          }
        />

        <Route
          path="/users/group/:groupid"
          element={
            <ProtectedRouteComponent>
              <UsersByGroupPage />
            </ProtectedRouteComponent>
          }
        />

        <Route
          path="/user_profile"
          element={
            <ProtectedRouteComponent>
              <UserProfilePage
                email={authData.userEmail ?? ""}
                phone={"No PHONES ?"}
                role={authData.userRole ?? ""}
                projectsCount={authData.usergroupid ?? -1}
                avatarUrl={authData.userProfilePic ?? ""}
              />
            </ProtectedRouteComponent>
          }
        />

        <Route
          path="/asistente-ia"
          element={
            <ProtectedRouteComponent>
              <AIAssistantPage />
            </ProtectedRouteComponent>
          }
        />

        <Route
          path="/configuraciones"
          element={
            <ProtectedRouteComponent>
              <SettingsPage />
            </ProtectedRouteComponent>
         }
       /> 

        </Routes>
      </Box>
    </Router>
  );
}

export default App;
