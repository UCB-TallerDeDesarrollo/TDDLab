import { Box, Stack, Typography } from "@mui/material";
import { useAuth } from "../hooks/useAuth";
import { AuthBackground } from "../components/AuthBackground";
import { AuthHeader } from "../components/AuthHeader";
import FeedbackSnackbar from "../../../shared/components/FeedbackSnackbar";
import StatefulButton from "../../../shared/components/StatefulButton";
import ContentState from "../../../shared/components/ContentState";
import { OAuthProvider } from "../../../modules/User-Authentication/domain/AuthManager";
import { useNavigate } from "react-router-dom";
import { ILogger } from "../../../utils/Logs/domain/ILogger";
import { LoggerFactory } from "../../../utils/Logs/infraestructure/LoggerFactory";

const logger: ILogger = LoggerFactory.create("AuthPage");

export default function AuthPage() {
  const { login, loading, error, setError } = useAuth();
  let authStateContent = null;
  let navigate = useNavigate();
  if (loading) {
    authStateContent = <ContentState variant="loading" title="Accediendo..." />;
  } else if (error) {
    authStateContent = (
      <ContentState
        variant="error"
        title="No se pudo iniciar sesión"
        description={error}
      />
    );
  }
  async function handleLogin() {
    try {
      await login(OAuthProvider.Google);
      navigate("/");
    } catch (err: any) {
      logger.error(err?.message || "Error al iniciar sesión.");
    }
  }
  async function loginWithGitHub() {
    await login(OAuthProvider.GitHub);
  }
  return (
    <>
      <AuthBackground />
      <AuthHeader />
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          pt: { xs: 8, md: 12 },
          px: 2,
        }}
      >
        <Stack
          spacing={2}
          sx={{ width: "100%", maxWidth: 420, alignItems: "stretch" }}
        >
          <Typography
            variant="h4"
            sx={{ textAlign: "center", fontWeight: 600, color: "text.primary" }}
          >
            ¡Bienvenido al TDD Lab!
          </Typography>

          <Typography
            variant="h6"
            sx={{ textAlign: "center", color: "text.primary", mb: 2 }}
          >
            Ingresá tu cuenta para acceder
          </Typography>

          {authStateContent}

          <StatefulButton
            variantStyle="primary"
            onClick={handleLogin}
            disabled={loading}
            sx={{ width: "100%", height: 44 }}
          >
            Accedé con Google
          </StatefulButton>
        </Stack>
      </Box>

      <FeedbackSnackbar
        message={error || ""}
        open={!!error}
        onClose={() => setError(null)}
        severity="error"
      />
    </>
  );
}
