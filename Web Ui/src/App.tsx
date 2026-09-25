import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { CommitHistoryAdapter } from "./modules/TDDCycles-Visualization/repository/CommitHistoryAdapter";
import MainMenu from "./app/navigation/MainMenu";

import GroupsIcon from "@mui/icons-material/Groups";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import { NoteAdd } from "@mui/icons-material";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";

import { lazy, Suspense, useEffect } from "react";


import "./App.css";
import ProtectedRouteComponent from "./ProtectedRoute";
import { CircularProgress } from "@mui/material";
import { useAuthStore } from "./presentation/auth/store/useAuthStore";

const HomePage = lazy(() => import("./presentation/home/pages/HomePage"));
const LandingPage = lazy(() => import("./presentation/landing/pages/LandingPage"));
const Groups = lazy(() => import("./presentation/groups/pages/GroupsPage"));
const User = lazy(() => import("./presentation/users/pages/UserPage"));
const UsersByGroupPage = lazy(
  () => import("./presentation/users/pages/UserBygroupPage"),
);
const SettingsPage = lazy(() => import("./presentation/settings/pages/SettingsPage"));

const GestionTareas = lazy(() => import("./presentation/assignments/pages/AssignmentsPage"));
const AssignmentDetail = lazy(
  () => import("./presentation/assignments/pages/AssignmentDetail"),
);
const TDDChartPage = lazy(
  () => import("./presentation/tdd-visualization/pages/TDDChartPage"),
);
const Login = lazy(() => import("./presentation/auth/pages/AuthPage"));
const InvitationPage = lazy(
  () => import("./presentation/group-invitation/pages/InvitationPage"),
);
const MyPracticesPage = lazy(
  () => import("./presentation/my-practices/pages/MyPracticesPage"),
);
const PracticeDetail = lazy(() => import("./presentation/my-practices/pages/PracticeDetail"));
const AIAssistantPage = lazy(() => import("./presentation/ai-assistant/pages/AIAssistantPage"));

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
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const initAuthListener = useAuthStore((state) => state.initAuthListener);

  useEffect(() => {
    const unsubscribe = initAuthListener();
    return () => unsubscribe();
  }, [initAuthListener]);

  const isAuthenticated = Boolean(user?.email);
  if (loading) {
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
				{isAuthenticated && user?.role && (
					<MainMenu navArrayLinks={navArrayLinks} userRole={user.role} />
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
								isAuthenticated ? (
									<ProtectedRouteComponent>
										<HomePage />
									</ProtectedRouteComponent>
								) : (
									<LandingPage />
								)
							}
						/>

						<Route path="/landing" element={<LandingPage />} />

						<Route
							path="/groups"
							element={
								<ProtectedRouteComponent>
									<Groups />
								</ProtectedRouteComponent>
							}
						/>

						<Route
							path="/tareas"
							element={
								<ProtectedRouteComponent>
									<GestionTareas
										userRole={user?.role ?? ""}
										userGroupid={Number(user?.groupid ?? -1)}
									/>
								</ProtectedRouteComponent>
							}
						/>

						<Route
							path="/assignment/:id"
							element={
								<ProtectedRouteComponent>
									<AssignmentDetail
										role={user?.role ?? ""}
										userid={Number(user?.id ?? -1)}
									/>
								</ProtectedRouteComponent>
							}
						/>

						<Route path="/login" element={<Login />} />

						<Route
							path="/user"
							element={
								<ProtectedRouteComponent>
									<User />
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
							path="/mis-practicas"
							element={
								<ProtectedRouteComponent>
									<MyPracticesPage
										userRole={user?.role ?? ""}
										userid={Number(user?.id ?? 0)}
									/>
								</ProtectedRouteComponent>
							}
						/>

						<Route
							path="/mis-practicas/:id"
							element={
								<ProtectedRouteComponent>
									<PracticeDetail userid={Number(user?.id ?? 0)} title={""} />
								</ProtectedRouteComponent>
							}
						/>

						<Route
							path="/graph"
							element={
								<ProtectedRouteComponent>
									<TDDChartPage
										port={new CommitHistoryAdapter()}
										role={user?.role ?? ""}
										teacher_id={Number(user?.id ?? -1)}
										graphs="graph"
									/>
								</ProtectedRouteComponent>
							}
						/>

						<Route
							path="/aditionalgraph"
							element={
								<ProtectedRouteComponent>
									<TDDChartPage
										port={new CommitHistoryAdapter()}
										role={user?.role ?? ""}
										teacher_id={Number(user?.id ?? -1)}
										graphs="aditionalgraph"
									/>
								</ProtectedRouteComponent>
							}
						/>

						<Route path="/invitation" element={<InvitationPage />} />

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
