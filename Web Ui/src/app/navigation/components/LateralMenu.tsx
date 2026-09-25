import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { ReactElement, Dispatch, SetStateAction } from "react";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../presentation/auth/store/useAuthStore";

interface NavItem {
  title: string;
  path: string;
  icon: ReactElement;
}

interface NavLateralMenuProps {
  navArrayLinks: NavItem[];
  NavLink: React.ComponentType<any>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function NavLateralMenu({
  navArrayLinks,
  NavLink,
  setOpen,
}: Readonly<NavLateralMenuProps>) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const isLoggedIn = Boolean(user?.email);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate("/login");
  };

  return (
    <Box sx={{ width: 250 }}>
      <nav>
        <List>
          <Typography sx={{ marginLeft: "14px", fontWeight: "bold", mb: 1 }}>
            TDDLab
          </Typography>

          {navArrayLinks.map((item) => (
            <ListItem disablePadding key={item.title}>
              <ListItemButton
                component={NavLink}
                to={item.path}
                onClick={() => setOpen(false)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText>{item.title}</ListItemText>
              </ListItemButton>
            </ListItem>
          ))}

          <ListItem disablePadding>
            {isLoggedIn ? (
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText>Cerrar sesión</ListItemText>
              </ListItemButton>
            ) : (
              <ListItemButton
                component={NavLink}
                to="/login"
                onClick={() => setOpen(false)}
              >
                <ListItemIcon>
                  <LoginIcon />
                </ListItemIcon>
                <ListItemText>Iniciar sesión</ListItemText>
              </ListItemButton>
            )}
          </ListItem>
        </List>
      </nav>
    </Box>
  );
}
