import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import firebase from "../../firebaseConfig";
import SuccessfulEnrollmentPopUp from "./components/SuccessfulEnrollmentPopUp";
import Button from "@mui/material/Button";
import GitHubIcon from "@mui/icons-material/GitHub";
import { UserOnDb } from "../../modules/User-Authentication/domain/userOnDb.interface";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { CircularProgress, Grid } from "@mui/material";
import { handleSignInWithGitHub } from "../../modules/User-Authentication/application/signInWithGithub";
import { handleGithubSignOut } from "../../modules/User-Authentication/application/signOutWithGithub";
import { RegisterUserOnDb } from "../../modules/User-Authentication/application/registerUserOnDb";
import { useLocation } from "react-router-dom";
import PasswordComponent from "./components/PasswordPopUp";
import CheckRegisterGroupPopUp from "./components/CheckRegisterGroupPopUp";
import AdminAlertModal from "./components/AdminAlertModal";
import UpdateUserNamePopUp from "./components/UpdateUserNamePopUp";
import { setCookieAndGlobalStateForValidUser } from "../../modules/User-Authentication/application/setCookieAndGlobalStateForValidUser";

interface ExtendedUser extends User {
  backendId?: string;
  name?: string;
  idToken?: string;
}

function InvitationPage() {
  const location = useLocation();
  const getQueryParam = (param: string): string | number | undefined => {
    const searchParams = new URLSearchParams(location.search);
    const value = searchParams.get(param);
    if (param === "groupid") {
      return value ? parseInt(value, 10) : undefined;
    }
    return value ?? undefined;
  };

  const groupid = getQueryParam("groupid");
  const userType = getQueryParam("type");
  const [showNamePopup, setShowNamePopup] = useState(false);
  const [isSubmitting] = useState(false);
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);
  const [_popupMessage, setPopupMessage] = useState("");
  const [rotation, setRotation] = useState({ rotateX: 0, rotateY: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const dbAuthPort = new RegisterUserOnDb();
  useEffect(() => {
    const auth = getAuth(firebase);
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const [showPopUp, setShowPopUp] = useState(false);

  const handleSignUp = async () => {
    setIsLoading(true);
    try {
      const userData = await handleSignInWithGitHub();
      if (userData) {
        setUser(userData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePassVerification = async (password: string) => {
    setIsLoading(true);
    try {
      const result = await dbAuthPort.verifyPass(password);

      if (result === true) {
        await handleAcceptInvitation("teacher");
        return;
      }
      alert("Contraseña inválida");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePopPassword = async () => {
    setShowPasswordPopup(true);
  };

  const LoadingOverlay = () => (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 99999,
        backdropFilter: "blur(5px)",
      }}
    >
      <CircularProgress size={60} />
    </div>
  );

  const handleAcceptInvitation = async (type: string) => {
    if (!user?.email) return;
    setIsLoading(true);

    try {
      if (user?.email) {
        const [firstName, lastName] = (user.displayName?.split(" ") ?? [" ", " "]);
        const userObj: UserOnDb = {
          email: user.email,
          groupid: typeof groupid === "number" ? groupid : Number(groupid) || 1,
          role: type,
          firstName: firstName || '',
          lastName: lastName || ''
        };
        try {
          await dbAuthPort.register(userObj);
        } catch (error) {
          setPopupMessage("El usuario ya tiene un grupo asignado.");
          setOpenPopup(true);
          return;
        }
      }

      const idToken = await user.getIdToken();
      console.log("Firebase ID Token obtenido:", idToken);

      let registeredUser;
      try {
        registeredUser = await dbAuthPort.authenticateWithFirebase(idToken);
      } catch (authError) {
        registeredUser = await dbAuthPort.getAccountInfo(user.email);
      }

      if (!registeredUser?.id) {
        console.error("No se pudo obtener el usuario registrado del backend");
        return;
      }

      try {
        setCookieAndGlobalStateForValidUser(user, registeredUser, () => {
        });
      } catch (globalStateError) {
        console.warn("Error estableciendo estado global:", globalStateError);
      }

      setUser({
        ...user,
        backendId: registeredUser.id.toString(),
        displayName: registeredUser.firstName || user.displayName,
      });

      setShowNamePopup(true);

    } catch (error) {
      console.error("Error en handleAcceptInvitation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const [showAdminModal, setShowAdminModal] = useState(false);

  useEffect(() => {
    if (userType === "admin") {
      setShowAdminModal(true);
    }
  }, [userType]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = event;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();

    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    const rotateY = (x / width) * 30;
    const rotateX = -(y / height) * 30;

    setRotation({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ rotateX: 0, rotateY: 0 });
  };
  return (
    <div style={{ position: "relative" }}>
      {isLoading && <LoadingOverlay />}

      {user ? (
        <div>
          <Grid
            container
            spacing={2} 
            justifyContent="center" 
            alignItems="center"
            style={{ minHeight: "100vh" }}
            direction="column" 
          >
            <Grid
              item
              style={{
                width: user.displayName ? "400px" : "600px",
                transition: "width 0.3s ease",
              }}
            >
              <Card
                sx={{
                  "&:hover": {
                    boxShadow: "md",
                    borderColor: "neutral.outlinedHoverBorder",
                  },
                }}
                variant="outlined"
              >
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <div
                        style={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          style={{
                            width: 100,
                            height: 100,
                            borderRadius: "10%",
                            overflow: "hidden",
                          }}
                        >
                          <CardMedia
                            component="img"
                            alt="Imagen"
                            height="100%"
                            width="100%"
                            image={user.photoURL ?? "URL_POR_DEFECTO"}
                          />
                        </div>
                      </div>
                    </Grid>
                    <Grid
                      item
                      xs={8}
                      container
                      direction="column"
                      justifyContent="space-between"
                    >
                      <Grid item>
                        <Typography variant="h5" sx={{ marginBottom: 1 }}>
                          {user.displayName ?? user.email}
                        </Typography>
                      </Grid>
                      <Grid item sx={{ marginTop: "auto" }}>
                        <Button
                          onClick={handleGithubSignOut}
                          variant="contained"
                          color="primary"
                          disabled={isLoading}
                        >
                          Cerrar sesión
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item>
              <Card
                sx={{
                  width: user.displayName ? "400px" : "500px",
                  transition: "width 0.5s ease",
                }}
                variant="outlined"
              >
                <CardMedia
                  component="img"
                  alt="Imagen de portada"
                  height="50%" 
                  image="https://images.pexels.com/photos/6804068/pexels-photo-6804068.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" // Reemplaza con la ruta de tu imagen
                  sx={{
                    transition: "transform 0.1s ease-out",
                    transformStyle: "preserve-3d",
                    transform: `rotateX(${rotation.rotateX}deg) rotateY(${rotation.rotateY}deg)`,
                    boxShadow: "10px 10px 20px rgba(0, 0, 0, 0.5)",
                  }}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                />
                <CardContent>
                  <Typography variant="body1" sx={{ textAlign: "center" }}>
                    Israel Antezana te está invitando al curso
                  </Typography>
                  {userType === "student" && (
                    <Button
                      onClick={() => handleAcceptInvitation("student")}
                      variant="contained"
                      color="primary"
                      sx={{ marginTop: 2 }}
                      fullWidth
                      disabled={isLoading || isSubmitting}
                    >
                      {isSubmitting ? "Procesando..." : "Aceptar invitación al curso" }
                    </Button>
                  )}
                  {userType === "teacher" && (
                    <Button
                      onClick={handlePopPassword}
                      variant="contained"
                      color="primary"
                      sx={{ marginTop: 2 }}
                      fullWidth
                      disabled={isLoading || isSubmitting}
                    >
                      Aceptar invitación al curso como Docente
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          {showPasswordPopup && (
            <PasswordComponent
              open={showPasswordPopup}
              onClose={() => setShowPasswordPopup(false)}
              onSend={handlePassVerification}
            />
          )}
          {showNamePopup && user?.backendId && (
            <UpdateUserNamePopUp
              open={showNamePopup}
              onClose={() => {
                setShowNamePopup(false);
                setShowPopUp(true);
              }}
              userId={parseInt(user.backendId)}
              currentFirstName={user.displayName ?? undefined}
              setUser={setUser}
            />
          )}
          {showPopUp && <SuccessfulEnrollmentPopUp />}
          {openPopup && <CheckRegisterGroupPopUp />}
        </div>
      ) : (
        <Grid
          container
          spacing={0}
          direction="column"
          alignItems="center"
          justifyContent="center"
          style={{ minHeight: "100vh" }}
        >
          <Grid item>
            <Button color="primary" onClick={handleSignUp} disabled={isLoading}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <GitHubIcon style={{ marginRight: "8px" }} />
                Registrarse
              </div>
            </Button>
          </Grid>
        </Grid>
      )}
      <AdminAlertModal
        open={showAdminModal}
      />
    </div>
  );
}

export default InvitationPage;