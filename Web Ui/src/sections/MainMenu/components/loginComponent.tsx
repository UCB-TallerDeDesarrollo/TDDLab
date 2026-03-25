import {
  Avatar,
  Button,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckIfUserHasAccount } from "../../../modules/User-Authentication/application/checkIfUserHasAccount";
import { removeSessionCookie } from "../../../modules/User-Authentication/application/deleteSessionCookie";
import { handleSignInWithGitHub } from "../../../modules/User-Authentication/application/signInWithGithub";
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
    const userData = await handleSignInWithGitHub();
    if (userData?.email) {
      const idToken = await userData.getIdToken();
      const loginPort = new CheckIfUserHasAccount();
      const userAccount = await loginPort.userHasAnAccountWithToken(idToken);
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

  return (
    <React.Fragment>
      {!authData[0].userEmail ? (
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
      ) : compact ? (
        <React.Fragment>
          <IconButton
            onClick={(event) => setAnchorEl(event.currentTarget)}
            sx={{ ml: 1 }}
          >
            <Avatar
              src={authData[0].userProfilePic}
              alt="Profile Picture"
              sx={{
                width: 38,
                height: 38,
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
        <React.Fragment>
          <IconButton
            onClick={(event) => setAnchorEl(event.currentTarget)}
            sx={{ ml: 1 }}
          >
            <Avatar
              src={authData[0].userProfilePic}
              alt="Profile Picture"
              sx={{
                width: 50,
                height: 50,
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
      )}
    </React.Fragment>
  );
}
