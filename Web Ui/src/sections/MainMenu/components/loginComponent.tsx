import { useState, MouseEvent } from "react";
import { Button, Menu, MenuItem, Avatar, ListItemIcon, Divider, Box, Dialog, Typography, IconButton } from "@mui/material";
import Logout from "@mui/icons-material/Logout";
import GitHubIcon from "@mui/icons-material/GitHub";
import GoogleIcon from "@mui/icons-material/Google";
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from "react-router-dom";

import { CheckIfUserHasAccount } from "../../../modules/User-Authentication/application/checkIfUserHasAccount";
import { setGlobalState, useGlobalState } from "../../../modules/User-Authentication/domain/authStates";
import { removeSessionCookie } from "../../../modules/User-Authentication/application/deleteSessionCookie";
import { handleSignInWithGitHub } from "../../../modules/User-Authentication/application/signInWithGithub";
import { handleSignInWithGoogle } from "../../../modules/User-Authentication/application/signInWithGoogle";
import { handleGithubSignOut } from "../../../modules/User-Authentication/application/signOutWithGithub";
import { setCookieAndGlobalStateForValidUser } from "../../../modules/User-Authentication/application/setCookieAndGlobalStateForValidUser";
import { ValidationDialog } from "../../Shared/Components/ValidationDialog";

import "../styles/loginComponentStyles.css";

interface LoginComponentProps {
  loginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
}

export default function LoginComponent({ loginModalOpen, setLoginModalOpen }: LoginComponentProps) {
  const authData = useGlobalState("authData");
  const navigate = useNavigate();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // --- ESTADOS PARA LOS POP-UPS DE VALIDACIÓN ---
  const [validation, setValidation] = useState({
    open: false,
    message: "",
    isError: false
  });

  const showDialog = (message: string, error = true) => {
    setLoginModalOpen(false); 
    setValidation({ open: true, message, isError: error });
  };

  const handleClick = (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handlePostLogin = (userData: any, userAccount: any) => {
    if (userAccount) {
      setCookieAndGlobalStateForValidUser(userData, userAccount, () => {
        setLoginModalOpen(false);
        navigate("/assignments");
      });
      localStorage.setItem("userProfilePic", userData.photoURL || "");
    } else {
      showDialog("Disculpa, tu usuario no está registrado. Por favor, regístrate primero.");
    }
  };

  const handleLogin = async (provider: 'github' | 'google') => {
    try {
      const userData = provider === 'github' ? await handleSignInWithGitHub() : await handleSignInWithGoogle();
      
      if (userData?.email) {
        const idToken = await userData.getIdToken();
        const loginPort = new CheckIfUserHasAccount();
        
        // Ejecutamos la validación según el proveedor
        const userAccount = provider === 'github' 
            ? await loginPort.userHasAnAccountWithToken(idToken)
            : await loginPort.userHasAnAccountWithGoogleToken(idToken);

        handlePostLogin(userData, userAccount);
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Error al iniciar sesión";

      // Lógica de errores específicos recuperada
      if (errorMessage.includes("Google")) {
        showDialog("Este usuario está registrado con Google. Por favor, inicia sesión con Google.");
      } else if (errorMessage.includes("GitHub")) {
        showDialog("Este usuario está registrado con GitHub. Por favor, inicia sesión con GitHub.");
      } else if (errorMessage.includes("no encontrado") || errorMessage.includes("404")) {
        showDialog("Usuario no encontrado en el sistema. Por favor, regístrate primero.");
      } else {
        showDialog(errorMessage);
      }
    }
  };

  const handleLogoutAction = async () => {
    handleClose();
    await handleGithubSignOut();
    setGlobalState("authData", { userid: -1, userProfilePic: "", userEmail: "", usergroupid: -1, userRole: "" });
    await removeSessionCookie();
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="user-profile-group">
      {authData[0].userEmail ? (
        <>
          <Avatar src={authData[0].userProfilePic} alt="Profile" onClick={handleClick} className="user-avatar" />
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose} transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
            <MenuItem disabled className="user-menu-email">{authData[0].userEmail}</MenuItem>
            <Divider />
            <MenuItem onClick={handleLogoutAction} className="logout-menu-item">
              <ListItemIcon><Logout className="logout-icon-red" /></ListItemIcon>
              Cerrar Sesión
            </MenuItem>
          </Menu>
        </>
      ) : (
        <Box display="flex" gap={2} alignItems="center">
          <Button onClick={() => setLoginModalOpen(true)} variant="contained" className="btn-std btn-primary">
            Ir a TDD Lab
          </Button>
        </Box>
      )}

      {/* POP-UP DE SELECCIÓN DE CUENTA */}
      <Dialog open={loginModalOpen} onClose={() => setLoginModalOpen(false)} maxWidth="xs" fullWidth>
        <Box p={3} textAlign="center">
          <Box display="flex" justifyContent="flex-end">
            <IconButton onClick={() => setLoginModalOpen(false)}><CloseIcon /></IconButton>
          </Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>Bienvenido a TDDLab</Typography>
          <Typography variant="body2" color="textSecondary" mb={3}>Usa tu cuenta para acceder:</Typography>
          
          <Button className="btn-std btn-auth-github" fullWidth onClick={() => handleLogin('github')} startIcon={<GitHubIcon />} sx={{ mb: 2 }}>
            Accede con GitHub
          </Button>

          <Button className="btn-std btn-auth-google" fullWidth onClick={() => handleLogin('google')} startIcon={<GoogleIcon />}>
            Accede con Google
          </Button>
        </Box>
      </Dialog>

      {/* POP-UP DE ERROR / VALIDACIÓN (Recuperado) */}
      <ValidationDialog
        open={validation.open}
        title={validation.message}
        closeText="Aceptar"
        onClose={() => setValidation({ ...validation, open: false })}
        isError={validation.isError}
      />
    </div>
  );
}