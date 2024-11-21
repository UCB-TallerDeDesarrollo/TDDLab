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
import CheckRegisterGroupPopUp from "./components/CheckRegisterGroupPopUp";


function InvitationPage() {
  const location = useLocation();
  const getQueryParam = (param: string): string | number | undefined => {
    const searchParams = new URLSearchParams(location.search);
    const value = searchParams.get(param);
    if (param === "groupid") {
      return value ? parseInt(value, 10) : undefined;
    }
    return value ?? undefined;  };

  const groupid = getQueryParam("groupid");
  const userType = getQueryParam("type");

  const [user, setUser] = useState<User | null>(null);
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [openPopup, setOpenPopup] = useState(false); 
  const [, setPopupMessage] = useState(""); 

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
  console.log(type);
  if (user?.email) {
    const existingUser = await dbAuthPort.getAccountInfo(user.email);
    if (existingUser && existingUser.groupid) {
      console.log('El usuario ya tiene un grupo asignado:', existingUser.groupid);
      setPopupMessage("El usuario ya tiene un grupo asignado.");
      setOpenPopup(true); 
      return;
    }
    const userObj: UserOnDb = {
      email: user.email,
      groupid: typeof groupid === 'number' ? groupid : Number(groupid) || 1,
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
                  image="https://images.pexels.com/photos/6804068/pexels-photo-6804068.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" // Reemplaza con la ruta de tu imagen
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
                    >
                      Aceptar invitación al curso
                    </Button>
                  )}
                  {userType === "teacher" && (
                    <Button
                      onClick={handlePopPassword}
                      variant="contained"
                      color="primary"
                      sx={{ marginTop: 2 }}
                      fullWidth
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
          {showPopUp && <SuccessfulEnrollmentPopUp></SuccessfulEnrollmentPopUp>}
          {openPopup && <CheckRegisterGroupPopUp></CheckRegisterGroupPopUp>}
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
