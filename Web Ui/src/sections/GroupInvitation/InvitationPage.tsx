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
import { Grid } from "@mui/material";
import { handleSignInWithGitHub } from "../../modules/User-Authentication/application/signInWithGithub";
import { handleGithubSignOut } from "../../modules/User-Authentication/application/signOutWithGithub";
import { RegisterUserOnDb } from "../../modules/User-Authentication/application/registerUserOnDb";
import { useLocation } from "react-router-dom";
import PasswordComponent from "./components/PasswordPopUp";

function InvitationPage() {
  const location = useLocation();
  const getQueryParam = (param: string): number | undefined => {
    const searchParams = new URLSearchParams(location.search);
    const value = searchParams.get(param);
    return value ? parseInt(value, 10) : undefined;
  };

  const groupid = getQueryParam("groupid");

  const [user, setUser] = useState<User | null>(null);
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
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
    const userData = await handleSignInWithGitHub();
    if (userData) {
      setUser(userData);
    }
  };

  const handlePassVerification = async (password: string) => {
    const result = await dbAuthPort.verifyPass(password);

    if (result === true) {
      handleAcceptInvitation("teacher");
      return;
    }
    alert("Contraseña invalida");
  };

  const handlePopPassword = async () => {
    setShowPasswordPopup(true);
  };

  const handleAcceptInvitation = async (type: string) => {
    console.log(user?.email);
    console.log(groupid);

    // Have to Solve courseId error
    if (user?.email) {
      const userObj: UserOnDb = {
        id: user.userid,
        email: user.email,
        groupid: groupid ?? 1,
        role: type,
      };
      await dbAuthPort.register(userObj);
      setShowPopUp(true);
    }
  };

  return (
    <div>
      {user ? (
        <div>
          <Grid
            container
            spacing={2} // Agrega la separación deseada entre los Card
            justifyContent="center" // Centra los elementos horizontalmente
            alignItems="center" // Centra los elementos verticalmente
            style={{ minHeight: "100vh" }} // Asegura que los elementos ocupen toda la altura de la vista
            direction="column" // Alinea los elementos en una sola columna
          >
            <Grid item>
              <Card
                sx={{
                  width: 400, // Establece un ancho fijo para el primer Card
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
                        <Typography variant="h5" sx={{ marginBottom: 1 }}>
                          {user.displayName ?? "Usuario"}
                        </Typography>
                      </Grid>
                      <Grid item sx={{ marginTop: "auto" }}>
                        <Button
                          onClick={handleGithubSignOut}
                          variant="contained"
                          color="primary"
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
              <Card sx={{ width: 400 }} variant="outlined">
                <CardMedia
                  component="img"
                  alt="Imagen de portada"
                  height="50%" // La mitad superior del card
                  image="https://media.istockphoto.com/id/1400563511/es/foto/concepto-de-trabajo-en-equipo-y-asociaci%C3%B3n-las-manos-unen-piezas-del-rompecabezas-en-la.jpg?s=2048x2048&w=is&k=20&c=sCOTFRETLMg41khoit5_znVZidVevaoYnsJDRQpXGoE=" // Reemplaza con la ruta de tu imagen
                />
                <CardContent>
                  <Typography variant="body1" sx={{ textAlign: "center" }}>
                    Israel Antezana te está invitando al curso
                  </Typography>
                  <Button
                    onClick={() => handleAcceptInvitation("student")}
                    variant="contained"
                    color="primary"
                    sx={{ marginTop: 2 }}
                    fullWidth
                  >
                    Aceptar invitación al curso
                  </Button>
                  <Button
                    onClick={handlePopPassword}
                    variant="contained"
                    color="primary"
                    sx={{ marginTop: 2 }}
                    fullWidth
                  >
                    Aceptar invitación al curso como Docente
                  </Button>
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
          {showPopUp && <SuccessfulEnrollmentPopUp></SuccessfulEnrollmentPopUp>}
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
            <Button color="primary" onClick={handleSignUp}>
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
    </div>
  );
}

export default InvitationPage;
