import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { CommitHistoryAdapter } from "./modules/TDDCycles-Visualization/repository/CommitHistoryAdapter"; //Revisar el cambio por puerto
import MainMenu from "./sections/MainMenu/MainMenu";
import GroupsIcon from "@mui/icons-material/Groups";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings"; 
import { NoteAdd } from "@mui/icons-material";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import { lazy, Suspense, useEffect } from "react";
import {
  setGlobalState,
  useGlobalState,
} from "./modules/User-Authentication/domain/authStates";
import { getSessionCookie } from "./modules/User-Authentication/application/getSessionCookie";
import "./App.css";
import ProtectedRouteComponent from "./ProtectedRoute";
import {
  CircularProgress,
} from "@mui/material";

const GestionTareas = lazy(() => import("./sections/Assignments/AssignmentsPage"));
const AssignmentDetail = lazy(() => import("./sections/Assignments/AssignmentDetail"));
const TDDChartPage = lazy(() => import("./sections/TDDCycles-Visualization/TDDChartPage"));
const Login = lazy(() => import("./sections/Login/LoginPage"));
const Groups = lazy(() => import("./sections/Groups/GroupsPage"));
const HomePage = lazy(() => import("./features/home/pages/HomePage"));
const User = lazy(() => import("./features/users/pages/UserPage"));
const InvitationPage = lazy(() => import("./sections/GroupInvitation/InvitationPage"));
const UsersByGroupPage = lazy(() => import("./features/users/pages/UserBygroupPage"));
const MyPracticesPage = lazy(() => import("./sections/MyPractices/MyPracticesPage"));
const PracticeDetail = lazy(() => import("./sections/MyPractices/PracticeDetail"));
const AIAssistantPage = lazy(() => import("./sections/AIAssistant/AIAssistantPage"));
const SettingsPage = lazy(() => import("./features/settings/pages/SettingsPage"));

const navArrayLinks = [
  {
    title: "Inicio",
    path: "/",
    icon: <HomeOutlinedIcon />,
    access: ["admin", "student", "teacher"],
  },
  {
    title: "Grupos",
    path: "/groups",
    icon: <GroupsIcon />,
    access: ["admin", "teacher"],
  },
  {
    title: "Tareas",
    path: "/tareas",
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
        <MainMenu navArrayLinks={navArrayLinks} userRole={authData.userRole} />
      )}
      <Suspense
        fallback={
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
        }
      >
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRouteComponent>
                <HomePage />
              </ProtectedRouteComponent>
            }
          />
          <Route
            path="/tareas"
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
      </Suspense>
    </Router>
  );
}

export default App;
