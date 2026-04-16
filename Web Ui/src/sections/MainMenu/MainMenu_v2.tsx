import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon, 
  ListItemText,
  Typography,
} from "@mui/material";


import logo from '../../../public/tddlab.ico';
import { ReactElement } from "react";
import { useLocation, NavLink } from "react-router-dom";
import LoginComponent from "./components/loginComponent";
import MainMenuSX from "./styles/MainMenu";

type NavLinkItem = {
  title: string;
  path: string;
  icon: ReactElement;
  access: string[];
};

interface NavbarProps {
  navArrayLinks: NavLinkItem[];
  userRole: string;
  mobileOpen?: boolean;
  onClose?: () => void;
  isTabletOrMobile?: boolean;
}

export default function MainMenu_v2({
  navArrayLinks,
  userRole,
  mobileOpen = false,
  onClose,
  isTabletOrMobile = false
}: Readonly<NavbarProps>) {
  const location = useLocation();

  const menuContent = (
    <Box sx={MainMenuSX.sidebarContent}>
      <Box component={NavLink} to="/" sx={MainMenuSX.logoLink}>
        <img src={logo} alt="TDDLab Logo" style={{ width: 48, height: 48 }} />
        <Box sx={MainMenuSX.logoTextContainer}>
          <Box sx={MainMenuSX.logoLetterRow}>
            {Array.from("TDD").map((char, idx) => (
              <Typography key={char + "tdd" + idx} variant="h5" fontWeight={100} sx={MainMenuSX.logoTddLetter}>
                {char}
              </Typography>
            ))}
          </Box>
          <Box sx={MainMenuSX.logoLetterRow}>
            {["L", "A", "B"].map((char, idx) => (
              <Typography key={char + "lab" + idx} variant="caption" fontWeight={500} sx={MainMenuSX.logoLabLetter}>
                {char}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>

      <List sx={MainMenuSX.navList}>
        {navArrayLinks.map(
          (item) =>
            item.access.includes(userRole) && (
              <ListItem disablePadding key={item.title} sx={MainMenuSX.navListItem}>
                <ListItemButton
                  component={NavLink}
                  to={item.path}
                  sx={MainMenuSX.navListItemButton(location.pathname === item.path)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    primaryTypographyProps={{ fontWeight: 500, fontSize: 15 }}
                  />
                </ListItemButton>
              </ListItem>
            )
        )}
      </List>

      <Box sx={MainMenuSX.loginContainer}>
        <LoginComponent />
      </Box>
    </Box>
  )

  if(isTabletOrMobile) {
    return (
      <Drawer
        anchor = "left"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted:true}}
        sx={MainMenuSX.mobileDrawer}
      >
        {menuContent}
      </Drawer>
    );
  }

  return (
    <Box sx = {MainMenuSX.sidebar}>
      {menuContent}
    </Box>
  )
}
