import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import firebase from "../../firebaseConfig";
import SuccessfulEnrollmentPopUp from "./components/SuccessfulEnrollmentPopUp";
import Button from "@mui/material/Button";
import GitHubIcon from "@mui/icons-material/GitHub";
import GoogleIcon from "@mui/icons-material/Google";
import { UserOnDb } from "../../modules/User-Authentication/domain/userOnDb.interface";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { CircularProgress, Grid } from "@mui/material";
import { handleSignInWithGitHub } from "../../modules/User-Authentication/application/signInWithGithub";
import { handleSignInWithGoogle } from "../../modules/User-Authentication/application/signInWithGoogle";
import { handleGithubSignOut } from "../../modules/User-Authentication/application/signOutWithGithub";
import { RegisterUserOnDb } from "../../modules/User-Authentication/application/registerUserOnDb";
import { useLocation } from "react-router-dom";
import PasswordComponent from "./components/PasswordPopUp";
import CheckRegisterGroupPopUp from "./components/CheckRegisterGroupPopUp";
import AdminAlertModal from "./components/AdminAlertModal";
import "./InvitationPage.css";

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

  const handleSignUp = async () => {
    setIsLoading(true);
    try {
      const userData = await handleSignInWithGitHub();
      if (userData) {
        setUser(userData);
        setAuthProvider("github");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpWithGoogle = async () => {
    setIsLoading(true);
    try {
      const userData = await handleSignInWithGoogle();
      if (userData) {
        setUser(userData);
        setAuthProvider("google");
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
    <div className="invitation-loading-overlay">
      <CircularProgress size={60} />
    </div>
  );

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

  const hasDisplayName = Boolean(user?.displayName);

  return (
    <div className="invitation-page-root">
      {isLoading && <LoadingOverlay />}

      {user ? (
        <section className="invitation-page-section">
          <div className="invitation-page-content">
            <div className={`invitation-user-card-wrap ${hasDisplayName ? "" : "invitation-user-card-wrap--wide"}`}>
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
                      <div className="invitation-card-media-container">
                        <div className="invitation-avatar-box">
                          <CardMedia
                            component="img"
                            alt="Imagen"
                            height="100%"
                            width="100%"
                            image={user.photoURL ?? "URL_POR_DEFECTO"} // Reemplaza con la ruta de tu imagen.
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
                        <Typography variant="h5" className="invitation-user-name">
                          {user.displayName ?? user.email}
                        </Typography>
                      </Grid>
                      <Grid item className="invitation-signout-row">
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
            </div>
            <div className={`invitation-main-card-wrap ${hasDisplayName ? "" : "invitation-main-card-wrap--wide"}`}>
              <Card
                variant="outlined"
              >
                <CardMedia
                  component="img"
                  alt="Imagen de portada"
                  height="50%" // La mitad superior del card
                  image="https://images.pexels.com/photos/6804068/pexels-photo-6804068.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" // Reemplaza con la ruta de tu imagen
                  className="invitation-cover-media"
                  sx={{
                    transform: `rotateX(${rotation.rotateX}deg) rotateY(${rotation.rotateY}deg)`,
                  }}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                />
                <CardContent>
                  <Typography variant="body1" className="invitation-description">
                    Israel Antezana te está invitando al curso
                  </Typography>
                  {userType === "student" && (
                    <Button
                      onClick={() => handleAcceptInvitation("student")}
                      variant="contained"
                      color="primary"
                      className="invitation-action-btn"
                      fullWidth
                      disabled={isLoading}
                    >
                      Aceptar invitación al curso
                    </Button>
                  )}
                  {userType === "teacher" && (
                    <Button
                      onClick={handlePopPassword}
                      variant="contained"
                      color="primary"
                      className="invitation-action-btn"
                      fullWidth
                      disabled={isLoading}
                    >
                      Aceptar invitación al curso como Docente
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          {showPasswordPopup && (
            <PasswordComponent
              open={showPasswordPopup}
              onClose={() => setShowPasswordPopup(false)}
              onSend={handlePassVerification}
            />
          )}
          {showPopUp && <SuccessfulEnrollmentPopUp authProvider={authProvider}></SuccessfulEnrollmentPopUp>}
          {openPopup && <CheckRegisterGroupPopUp></CheckRegisterGroupPopUp>}
        </section>
      ) : (
        <Grid
          container
          spacing={0}
          direction="column"
          alignItems="center"
          justifyContent="center"
          className="invitation-auth-grid"
        >
          <Grid item>
            <div className="invitation-auth-actions">
              <Button 
                onClick={handleSignUp} 
                disabled={isLoading}
                variant="contained"
                className="invitation-auth-btn invitation-auth-btn--github"
              >
                <div className="invitation-auth-btn-content">
                  <GitHubIcon className="invitation-auth-btn-icon" />
                  Registrarse con GitHub
                </div>
              </Button>
              <Button 
                onClick={handleSignUpWithGoogle} 
                disabled={isLoading}
                variant="contained"
                className="invitation-auth-btn invitation-auth-btn--google"
              >
                <div className="invitation-auth-btn-content">
                  <GoogleIcon className="invitation-auth-btn-icon" />
                  Registrarse con Google
                </div>
              </Button>
            </div>
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