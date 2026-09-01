import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { removeSessionCookie } from "../../../modules/User-Authentication/application/deleteSessionCookie";
import { handleGithubSignOut } from "../../../modules/User-Authentication/application/signOutWithGithub";
import {
  setGlobalState,
  useGlobalState,
} from "../../../modules/User-Authentication/domain/authStates";

interface LoginComponentProps {
  compact?: boolean;
}

export default function LoginComponent(_props: Readonly<LoginComponentProps>) {
  const authData = useGlobalState("authData");
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

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
      {isLoggedIn && (
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
      )}
    </React.Fragment>
  );
}
