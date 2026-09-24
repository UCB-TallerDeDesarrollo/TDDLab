import {
  Avatar,
  Button,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../presentation/auth/store/useAuthStore";

interface LoginComponentProps {
  compact?: boolean;
}

export default function LoginComponent({
  compact = false,
}: Readonly<LoginComponentProps>) {
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);

  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleLogin = async () => {
    await login();
  };

  const handleLogout = async () => {
    setAnchorEl(null);
    await logout();
    navigate("/login");
  };

  const isLoggedIn = Boolean(user?.email);

  return (
    <React.Fragment>
      {isLoggedIn ? (
        <React.Fragment>
          <IconButton
            onClick={(event) => setAnchorEl(event.currentTarget)}
            sx={{ ml: { xs: 0, sm: 1 }, p: { xs: 0, sm: undefined }, flexShrink: 0 }}
          >
            <Avatar
              src={user?.photoUrl || ""}
              alt="Profile Picture"
              sx={{
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
          Iniciar sesión
        </Button>
      )}
    </React.Fragment>
  );
}
