import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import firebase from "../../firebaseConfig";
import SuccessfulEnrollmentPopUp from "./components/SuccessfulEnrollmentPopUp";
import Button from "@mui/material/Button";
import { IconifyIcon } from "../../sections/Shared/Components";
import { UserOnDb } from "../../modules/User-Authentication/domain/userOnDb.interface";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { Grid, Box, useTheme } from "@mui/material";
import FullScreenLoader from "../../components/FullScreenLoader/FullScreenLoader";
import { handleSignInWithGitHub } from "../../modules/User-Authentication/application/signInWithGithub";
import { handleSignInWithGoogle } from "../../modules/User-Authentication/application/signInWithGoogle";
import { handleGithubSignOut } from "../../modules/User-Authentication/application/signOutWithGithub";
import { RegisterUserOnDb } from "../../modules/User-Authentication/application/registerUserOnDb";
import { useLocation } from "react-router-dom";
import PasswordComponent from "./components/PasswordPopUp";
import CheckRegisterGroupPopUp from "./components/CheckRegisterGroupPopUp";
import AdminAlertModal from "./components/AdminAlertModal";
import "../../App.css";

function InvitationPage() {
  const theme = useTheme();
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

  const [user, setUser] = useState<User | null>(null);
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);
  const [_popupMessage, setPopupMessage] = useState("");
  const [rotation, setRotation] = useState({ rotateX: 0, rotateY: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [authProvider, setAuthProvider] = useState<"github" | "google" | null>(null);
  const dbAuthPort = new RegisterUserOnDb();
  useEffect(() => {
    const auth = getAuth(firebase);
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      if (authUser) {
        const providerData = authUser.providerData;
        if (providerData && providerData.length > 0) {
          const providerId = providerData[0].providerId;
          if (providerId === "google.com") {
            setAuthProvider("google");
          } else if (providerId === "github.com") {
            setAuthProvider("github");
          }
        }
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const [showPopUp, setShowPopUp] = useState(false);

  const handleSignUpWithProvider = async (provider: "github" | "google") => {
    setIsLoading(true);
    try {
      const userData =
        provider === "github"
          ? await handleSignInWithGitHub()
          : await handleSignInWithGoogle();

      if (userData) {
        setUser(userData);
        setAuthProvider(provider);
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

  const handleAcceptInvitation = async (type: string) => {
    setIsLoading(true);
    try {
      if (user?.email) {
        const userGroupid = typeof groupid === "number" ? groupid : Number(groupid) || 1;
        
        try {
          if (authProvider === "google") {
            const idToken = await user.getIdToken();
            await dbAuthPort.registerWithGoogle(idToken, userGroupid, type);
          } else {
            const userObj: UserOnDb = {
              email: user.email,
              groupid: userGroupid,
              role: type,
            };
            await dbAuthPort.register(userObj);
          }
        } catch (error) {
          setPopupMessage("El usuario ya tiene un grupo asignado.");
          setOpenPopup(true);
          return;
        }

        setShowPopUp(true);
      }
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

  const primaryButtonStyles = {
    textTransform: "none" as const,
    transition: "all 0.175s ease-out",
    "&:hover": {
      filter: "brightness(0.9)",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    },
    "&:active": {
      transform: "scale(0.97)",
    },
    "&:disabled": {
      backgroundColor: theme.palette.action.disabled,
    },
  };

  return (
    <Box style={{ position: "relative" }}>
      <FullScreenLoader isLoading={isLoading} variant="overlay" blur />

      {user ? (
        <Box className="invitation-card-container" sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "100vh", gap: 4 }}>
          <Box
            className={`invitation-user-card ${
              user.displayName ? "expanded" : ""
            }`}
            sx={{
              width: "100%",
              maxWidth: user.displayName ? 600 : 400,
              transition: "width 0.3s ease",
            }}
          >
            <Card variant="outlined">
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Box
                      sx={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <Box
                        sx={{
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
                      </Box>
                    </Box>
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
                        sx={primaryButtonStyles}
                      >
                        Cerrar sesión
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>

          <Box
            className={`invitation-content-card ${
              user.displayName ? "expanded" : ""
            }`}
            sx={{
              width: "100%",
              maxWidth: user.displayName ? 400 : 500,
              transition: "width 0.5s ease",
            }}
          >
            <Card variant="outlined">
              <CardMedia
                component="img"
                alt="Imagen de portada"
                height="50%"
                image="https://images.pexels.com/photos/6804068/pexels-photo-6804068.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
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
                <Typography variant="body1" sx={{ textAlign: "center", my: 1, color: theme.palette.text.primary }}>
                  Israel Antezana te está invitando al curso
                </Typography>

                {userType === "student" && (
                  <Button
                    onClick={() => handleAcceptInvitation("student")}
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={isLoading}
                    sx={{ ...primaryButtonStyles, marginTop: 2 }}
                  >
                    Aceptar invitación al curso
                  </Button>
                )}

                {userType === "teacher" && (
                  <Button
                    onClick={handlePopPassword}
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={isLoading}
                    sx={{ ...primaryButtonStyles, marginTop: 2 }}
                  >
                    Aceptar invitación al curso como Docente
                  </Button>
                )}
              </CardContent>
            </Card>
          </Box>
          {showPasswordPopup && (
            <PasswordComponent
              open={showPasswordPopup}
              onClose={() => setShowPasswordPopup(false)}
              onSend={handlePassVerification}
            />
          )}
          {showPopUp && (
            <SuccessfulEnrollmentPopUp
              authProvider={authProvider}
            ></SuccessfulEnrollmentPopUp>
          )}
          {openPopup && <CheckRegisterGroupPopUp></CheckRegisterGroupPopUp>}
        </Box>
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
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <Button
                onClick={() => handleSignUpWithProvider("github")}
                disabled={isLoading}
                variant="contained"
                sx={{
                  backgroundColor: "#24292e",
                  color: "white",
                  px: 3,
                  py: 1.25,
                  fontWeight: 500,
                  ...primaryButtonStyles,
                  "&:hover:not(:disabled)": {
                    backgroundColor: "#1a1e22",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                  }}
                >
                  <IconifyIcon
                    icon="mdi:github"
                    width={20}
                    height={20}
                    color="white"
                    hoverColor="#e0e0e0"
                  />
                  Registrarse con GitHub
                </Box>
              </Button>
              <Button
                onClick={() => handleSignUpWithProvider("google")}
                disabled={isLoading}
                variant="contained"
                sx={{
                  backgroundColor: "#4285f4",
                  color: "white",
                  px: 3,
                  py: 1.25,
                  fontWeight: 500,
                  ...primaryButtonStyles,
                  "&:hover:not(:disabled)": {
                    backgroundColor: "#3367d6",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                  }}
                >
                  <IconifyIcon
                    icon="mdi:google"
                    width={20}
                    height={20}
                    color="white"
                    hoverColor="#e0e0e0"
                  />
                  Registrarse con Google
                </Box>
              </Button>
            </Box>
          </Grid>
        </Grid>
      )}
      <AdminAlertModal open={showAdminModal} />
    </Box>
  );
}

export default InvitationPage;
