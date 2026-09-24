import Button from "@mui/material/Button";
import GitHubIcon from "@mui/icons-material/GitHub";
import GoogleIcon from "@mui/icons-material/Google";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";

import FeedbackSnackbar from "../../../shared/components/FeedbackSnackbar";
import AdminAlertModal from "../components/AdminAlertModal";
import CheckRegisterGroupPopUp from "../components/CheckRegisterGroupPopUp";
import LoadingOverlay from "../components/LoadingOverlay";
import PasswordComponent from "../components/PasswordPopUp";
import SuccessfulEnrollmentPopUp from "../components/SuccessfulEnrollmentPopUp";
import { useInvitationPage } from "../hooks/useInvitationPage";

const DEFAULT_AVATAR = "https://via.placeholder.com/100?text=User";
const COVER_IMAGE = "https://images.pexels.com/photos/6804068/pexels-photo-6804068.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";

function InvitationPage() {
  const invitation = useInvitationPage();

  return (
    <Box sx={{ position: "relative" }}>
      {invitation.isLoading && <LoadingOverlay />}

      {invitation.user ? (
        <Box>
          <Grid
            container
            spacing={2}
            justifyContent="center"
            alignItems="center"
            direction="column"
            sx={{ minHeight: "100vh" }}
          >
            {/* Tarjeta de Usuario */}
            <Grid
              item
              sx={{
                width: invitation.user.displayName ? "400px" : "600px",
                transition: "width 0.3s ease",
              }}
            >
              <Card
                variant="outlined"
                sx={{
                  "&:hover": {
                    boxShadow: 3,
                    borderColor: "neutral.outlinedHoverBorder",
                  },
                }}
              >
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
                            alt="Avatar de usuario"
                            height="100%"
                            width="100%"
                            image={invitation.user.photoURL ?? DEFAULT_AVATAR}
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
                        <Typography variant="h5" sx={{ mb: 1 }}>
                          {invitation.user.displayName ?? invitation.user.email}
                        </Typography>
                      </Grid>
                      <Grid item sx={{ mt: "auto" }}>
                        <Button
                          onClick={invitation.handleSignOut}
                          variant="contained"
                          color="primary"
                          disabled={invitation.isLoading}
                        >
                          Cerrar sesión
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Tarjeta de Invitación con efecto 3D */}
            <Grid item>
              <Card
                variant="outlined"
                sx={{
                  width: invitation.user.displayName ? "400px" : "500px",
                  transition: "width 0.5s ease",
                }}
              >
                <CardMedia
                  component="img"
                  alt="Imagen de portada"
                  height="200"
                  image={COVER_IMAGE}
                  sx={{
                    transition: "transform 0.1s ease-out",
                    transformStyle: "preserve-3d",
                    transform: `rotateX(${invitation.rotation.rotateX}deg) rotateY(${invitation.rotation.rotateY}deg)`,
                    boxShadow: "10px 10px 20px rgba(0, 0, 0, 0.5)",
                    cursor: "pointer",
                  }}
                  onMouseMove={invitation.handleMouseMove}
                  onMouseLeave={invitation.handleMouseLeave}
                />
                <CardContent>
                  <Typography variant="body1" align="center">
                    Israel Antezana te está invitando al curso
                  </Typography>

                  {invitation.userType === "student" && (
                    <Button
                      onClick={() => invitation.handleAcceptInvitation("student")}
                      variant="contained"
                      color="primary"
                      fullWidth
                      disabled={invitation.isLoading}
                      sx={{ mt: 2 }}
                    >
                      Aceptar invitación al curso
                    </Button>
                  )}

                  {invitation.userType === "teacher" && (
                    <Button
                      onClick={() => invitation.setShowPasswordPopup(true)}
                      variant="contained"
                      color="primary"
                      fullWidth
                      disabled={invitation.isLoading}
                      sx={{ mt: 2 }}
                    >
                      Aceptar invitación al curso como Docente
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Modales y Popups */}
          {invitation.showPasswordPopup && (
            <PasswordComponent
              open={invitation.showPasswordPopup}
              onClose={() => invitation.setShowPasswordPopup(false)}
              onSend={invitation.handlePassVerification}
            />
          )}
          {invitation.showPopUp && (
            <SuccessfulEnrollmentPopUp authProvider={invitation.authProvider} />
          )}
          {invitation.openPopup && <CheckRegisterGroupPopUp />}
        </Box>
      ) : (
        /* Vista no autenticado */
        <Grid
          container
          spacing={0}
          direction="column"
          alignItems="center"
          justifyContent="center"
          sx={{ minHeight: "100vh" }}
        >
          <Grid item>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
              <Button
                onClick={invitation.handleSignUp}
                disabled={invitation.isLoading}
                variant="contained"
                startIcon={<GitHubIcon />}
                sx={{
                  backgroundColor: "#24292e",
                  color: "white",
                  px: 2.5,
                  py: 1.2,
                  textTransform: "uppercase",
                  fontWeight: 500,
                  "&:hover": { backgroundColor: "#1a1e22" },
                  "&:disabled": { backgroundColor: "#ccc" },
                }}
              >
                Registrarse con GitHub
              </Button>

              <Button
                onClick={invitation.handleSignUpWithGoogle}
                disabled={invitation.isLoading}
                variant="contained"
                startIcon={<GoogleIcon />}
                sx={{
                  backgroundColor: "#4285f4",
                  color: "white",
                  px: 2.5,
                  py: 1.2,
                  textTransform: "uppercase",
                  fontWeight: 500,
                  "&:hover": { backgroundColor: "#3367d6" },
                  "&:disabled": { backgroundColor: "#ccc" },
                }}
              >
                Registrarse con Google
              </Button>
            </Box>
          </Grid>
        </Grid>
      )}

      <AdminAlertModal open={invitation.showAdminModal} />
      <FeedbackSnackbar
        open={Boolean(invitation.feedbackMessage)}
        message={invitation.feedbackMessage}
        severity="warning"
        onClose={() => invitation.setFeedbackMessage("")}
      />
    </Box>
  );
}

export default InvitationPage;
