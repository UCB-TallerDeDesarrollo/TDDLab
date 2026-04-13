import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemButton,
  ListItemText,
  Divider,
  Button,
  IconButton
} from "@mui/material";
import { ReactElement, Dispatch, SetStateAction } from "react";
import LogoutIcon from "@mui/icons-material/Logout"; 
import "../../../App.css";
import "../../MainMenu/styles/LateralMenuStyles.css"
import MenuIcon from "@mui/icons-material/Menu";

interface NavItem {
  title: string;
  path: string;
  icon: ReactElement;
}

interface NavLateralMenuProps {
  navArrayLinks: NavItem[];
  NavLink: React.ComponentType<any>;
  setOpen: Dispatch<SetStateAction<boolean>>;
  userEmail: string;
  onLogout: () => void;
}

export default function NavLateralMenu({
  navArrayLinks,
  NavLink,
  setOpen,
  userEmail,
  onLogout
}: Readonly<NavLateralMenuProps>) {
  return (
    <Box className="drawer-container">
      <Box className="drawer-header">
        <IconButton 
          onClick={() => setOpen(false)} 
          className="drawer-close-btn"
        >
          <MenuIcon />
        </IconButton>
      </Box>
      <nav className="drawer-nav">
        <List className="drawer-list-container">
          {navArrayLinks.map((item) => (
            <Box key={item.title}>
              <ListItem disablePadding>
                <ListItemButton
                  component={NavLink}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className="drawer-item-button"
                >
                  <ListItemIcon className="drawer-icon">{item.icon}</ListItemIcon>
                  <ListItemText primary={item.title} className="drawer-text" />
                </ListItemButton>
              </ListItem>
              <Divider className="drawer-divider" />
            </Box>
          ))}
        </List>
      </nav>

      <Box className="drawer-footer">
        {userEmail ? (
          <Button 
            fullWidth 
            variant="outlined" 
            className="drawer-logout-btn"
            onClick={() => { onLogout(); setOpen(false); }}
            startIcon={<LogoutIcon />}
          >
            Cerrar sesión
          </Button>
        ) : (
          <Button 
            fullWidth 
            variant="contained" 
            component={NavLink} 
            to="/login"
            onClick={() => setOpen(false)}
            className="drawer-login-btn"
          >
            Iniciar sesión
          </Button>
        )}
      </Box>
    </Box>
  );
}