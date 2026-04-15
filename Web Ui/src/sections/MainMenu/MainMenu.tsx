import {
  Button,
  Box,
  AppBar,
  Toolbar,
  Typography,
} from "@mui/material";

import { useLocation, NavLink } from "react-router-dom";
import WindowIcon from "@mui/icons-material/Window";
import LoginComponent from "./components/loginComponent";
import MobileDrawer from "./components/MobileDrawer";
import { NavLink as NavLinkType } from "../../types/navigation.types";
import { useFilteredNavLinks } from "../../hooks/useFilteredNavLinks";


interface NavbarProps {
  navArrayLinks: NavLinkType[];
  userRole: string;
}

export default function MainMenu({
  navArrayLinks,
  userRole,
}: Readonly<NavbarProps>) {
  const location = useLocation();

  const filteredLinks = useFilteredNavLinks(navArrayLinks, userRole);

  const activeButton = filteredLinks.find(
    (navLink) => navLink.path === location.pathname
  )?.title;

  return (
    <div style={{ marginTop: "100px" }}>
      <AppBar position="fixed" sx={{ background: "#052845" }}>
        <Toolbar
          style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "row" }}>
            <MobileDrawer navArrayLinks={filteredLinks} />
            <WindowIcon sx={{ marginRight: "6px", marginTop: "4px" }} />
            <NavLink
              to="/"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                TDDLab
              </Typography>
            </NavLink>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              marginRight: "30px",
            }}
          >
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              {filteredLinks.map((item) => (
                <Button
                  key={item.title}
                  component={NavLink}
                  to={item.path}
                  sx={{
                    borderBottom: activeButton === item.title ? "2px solid #fff" : "none",
                    color: activeButton === item.title ? "#fff" : "#A9A9A9",
                  }}
                >
                  {item.title}
                </Button>
              ))}
            </Box>
            <LoginComponent></LoginComponent>
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
}
