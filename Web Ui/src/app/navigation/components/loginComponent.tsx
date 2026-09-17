import {
  Avatar,
  Button,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckIfUserHasAccount } from "../../../modules/User-Authentication/application/checkIfUserHasAccount";
import { removeSessionCookie } from "../../../modules/User-Authentication/application/deleteSessionCookie";
import { handleSignInWithGoogle } from "../../../modules/User-Authentication/application/signInWithGoogle";
import { handleGithubSignOut } from "../../../modules/User-Authentication/application/signOutWithGithub";
import { setCookieAndGlobalStateForValidUser } from "../../../modules/User-Authentication/application/setCookieAndGlobalStateForValidUser";
import {
  setGlobalState,
  useGlobalState,
} from "../../../modules/User-Authentication/domain/authStates";

interface LoginComponentProps {
  compact?: boolean;
}

export default function LoginComponent({
  compact = false,
}: Readonly<LoginComponentProps>) {
  const authData = useGlobalState("authData");
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleLogin = async () => {
    const userData = await handleSignInWithGoogle();
    if (userData?.email) {
      const idToken = await userData.getIdToken();
      const loginPort = new CheckIfUserHasAccount();
      const userAccount = await loginPort.userHasAnAccountWithGoogleToken(idToken);
      setCookieAndGlobalStateForValidUser(userData, userAccount);
    }
  };

  const handleLogout = async () => {
    setAnchorEl(null);
    await handleGithubSignOut();
    setGlobalState("authData", {
      userid: -1,
      userProfilePic: "",
      userEmail: "",
      usergroupid: -1,
      userRole: "",
    });
    await removeSessionCookie();
    localStorage.clear();
    navigate("/login");
  };

  const isLoggedIn = Boolean(authData[0].userEmail);

  return (
    <React.Fragment>
      {isLoggedIn ? (
        <React.Fragment>
            <IconButton
              onClick={(event) => setAnchorEl(event.currentTarget)}
              sx={{ ml: { xs: 0, sm: 1 }, p: { xs: 0, sm: undefined }, flexShrink: 0 }}
            >
            <Avatar
              src={authData[0].userProfilePic}
              alt="Profile Picture"
              sx={{
                // fixed desktop size to avoid shrinking between close widths
                width: { xs: 38, sm: 42, md: 50 },
                height: { xs: 38, sm: 42, md: 50 },
                border: "2px solid rgba(255,255,255,0.24)",
              }}
            />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem onClick={handleLogout}>Salir</MenuItem>
          </Menu>
        </React.Fragment>
      ) : (
        <Button
          onClick={handleLogin}
          variant="contained"
          sx={{
            marginLeft: compact ? 0 : "18px",
            textTransform: "none",
            borderRadius: 999,
            bgcolor: "#1370D2",
            boxShadow: "none",
            px: compact ? 2 : 2.5,
            minWidth: compact ? "auto" : undefined,
          }}
        >
          Iniciar sesi{"\u00f3"}n
        </Button>
      )}
    </React.Fragment>
  );
}
