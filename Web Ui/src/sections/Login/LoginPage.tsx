import "./styles/Login.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Dialog, DialogContent, Typography, Box, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import GitHubIcon from "@mui/icons-material/GitHub";
import GoogleIcon from "@mui/icons-material/Google";

// Componentes internos
import { HeroSection } from "./components/HeroSection";
import { InfoCards } from "./components/InfoCards";
import { BenefitsSection } from "./components/BenefitsSection";
import { LandingFooter } from "./components/LandingFooter";
import { ValidationDialog } from "../Shared/Components/ValidationDialog";

// Lógica de negocio (importaciones que ya tenías)
import { handleSignInWithGitHub } from "../../modules/User-Authentication/application/signInWithGithub";
import { handleSignInWithGoogle } from "../../modules/User-Authentication/application/signInWithGoogle";
import { CheckIfUserHasAccount } from "../../modules/User-Authentication/application/checkIfUserHasAccount";
import { setCookieAndGlobalStateForValidUser } from "../../modules/User-Authentication/application/setCookieAndGlobalStateForValidUser";
import { useGlobalState } from "../../modules/User-Authentication/domain/authStates";

const LoginPage = () => {
  const navigate = useNavigate();
  const authData = useGlobalState("authData");
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [validation, setValidation] = useState({ open: false, msg: "", isError: false });

  useEffect(() => {
    if (authData[0].userEmail) navigate("/");
  }, [authData, navigate]);

  const handleLogin = async (provider: 'github' | 'google') => {
    try {
      const userData = provider === 'github' ? await handleSignInWithGitHub() : await handleSignInWithGoogle();
      if (userData?.email) {
        const idToken = await userData.getIdToken();
        const loginPort = new CheckIfUserHasAccount();
        const userCourse = provider === 'github' 
            ? await loginPort.userHasAnAccountWithToken(idToken)
            : await loginPort.userHasAnAccountWithGoogleToken(idToken);

        if (userCourse) {
          setCookieAndGlobalStateForValidUser(userData, userCourse, () => navigate("/"));
        } else {
          setValidation({ open: true, msg: "Usuario no registrado.", isError: true });
        }
      }
    } catch (error: any) {
      setValidation({ open: true, msg: error.message, isError: true });
    }
  };

  return (
    <div className="landing-wrapper">
      <HeroSection onLoginClick={() => setLoginModalOpen(true)} />
      <InfoCards />
      <BenefitsSection />
      <LandingFooter />

      {/* Modal de Acceso */}
      <Dialog open={loginModalOpen} onClose={() => setLoginModalOpen(false)} maxWidth="xs" fullWidth>
        <Box p={3} textAlign="center">
            <Box display="flex" justifyContent="flex-end">
                <IconButton onClick={() => setLoginModalOpen(false)}><CloseIcon /></IconButton>
            </Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>Bienvenido a TDDLab</Typography>
          <Typography variant="body2" color="textSecondary" mb={3}>Usa tu cuenta para acceder:</Typography>
          
          <Button 
            className="btn-std btn-auth-github" 
            fullWidth onClick={() => handleLogin('github')}
            startIcon={<GitHubIcon />}
            sx={{ mb: 2 }}
          >Accede con GitHub</Button>

          <Button 
            className="btn-std btn-auth-google" 
            fullWidth onClick={() => handleLogin('google')}
            startIcon={<GoogleIcon />}
          >Accede con Google</Button>
        </Box>
      </Dialog>

      <ValidationDialog
        open={validation.open}
        title={validation.msg}
        isError={validation.isError}
        onClose={() => setValidation({ ...validation, open: false })} closeText={""}      />
    </div>
  );
};

export default LoginPage;