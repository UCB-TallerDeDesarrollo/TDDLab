import Button from "@mui/material/Button";
import GoogleIcon from "@mui/icons-material/Google";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { Grid } from "@mui/material";
import FeedbackSnackbar from "../../../shared/components/FeedbackSnackbar";
import AdminAlertModal from "../components/AdminAlertModal";
import CheckRegisterGroupPopUp from "../components/CheckRegisterGroupPopUp";
import LoadingOverlay from "../components/LoadingOverlay";
import PasswordComponent from "../components/PasswordPopUp";
import SuccessfulEnrollmentPopUp from "../components/SuccessfulEnrollmentPopUp";
import { useInvitationPage } from "../hooks/useInvitationPage";

function InvitationPage() {
  const invitation = useInvitationPage();

  return (
    <div style={{ position: "relative" }}>
      {invitation.isLoading && <LoadingOverlay />}

      {invitation.user ? (
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
                width: invitation.user.displayName ? "400px" : "600px",
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
                            image={invitation.user.photoURL ?? "URL_POR_DEFECTO"}
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
                          {invitation.user.displayName ?? invitation.user.email}
                        </Typography>
                      </Grid>
                      <Grid item sx={{ marginTop: "auto" }}>
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
            <Grid item>
              <Card
                sx={{
                  width: invitation.user.displayName ? "400px" : "500px",
                  transition: "width 0.5s ease",
                }}
                variant="outlined"
              >
                <CardMedia
                  component="img"
                  alt="Imagen de portada"
                  height="50%"
                  image="https://images.pexels.com/photos/6804068/pexels-photo-6804068.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                  sx={{
                    transition: "transform 0.1s ease-out",
                    transformStyle: "preserve-3d",
                    transform: `rotateX(${invitation.rotation.rotateX}deg) rotateY(${invitation.rotation.rotateY}deg)`,
                    boxShadow: "10px 10px 20px rgba(0, 0, 0, 0.5)",
                  }}
                  onMouseMove={invitation.handleMouseMove}
                  onMouseLeave={invitation.handleMouseLeave}
                />
                <CardContent>
                  <Typography variant="body1" sx={{ textAlign: "center" }}>
                    Israel Antezana te está invitando al curso
                  </Typography>
                  {invitation.userType === "student" && (
                    <Button
                      onClick={() => invitation.handleAcceptInvitation("student")}
                      variant="contained"
                      color="primary"
                      sx={{ marginTop: 2 }}
                      fullWidth
                      disabled={invitation.isLoading}
                    >
                      Aceptar invitación al curso
                    </Button>
                  )}
                  {invitation.userType === "teacher" && (
                    <Button
                      onClick={() => invitation.setShowPasswordPopup(true)}
                      variant="contained"
                      color="primary"
                      sx={{ marginTop: 2 }}
                      fullWidth
                      disabled={invitation.isLoading}
                    >
                      Aceptar invitación al curso como Docente
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
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
            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", justifyContent: "center" }}>
              <Button
                onClick={invitation.handleSignUpWithGoogle}
                disabled={invitation.isLoading}
                variant="contained"
                sx={{
                  backgroundColor: "#4285f4",
                  color: "white",
                  padding: "10px 20px",
                  textTransform: "uppercase",
                  fontWeight: 500,
                  "&:hover": {
                    backgroundColor: "#3367d6",
                  },
                  "&:disabled": {
                    backgroundColor: "#ccc",
                  },
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <GoogleIcon style={{ marginRight: "8px" }} />
                  Registrarse con Google
                </div>
              </Button>
            </div>
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
    </div>
  );
}

export default InvitationPage;
