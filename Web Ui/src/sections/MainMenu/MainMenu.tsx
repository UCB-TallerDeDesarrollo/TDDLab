import {
  AppBar,
  Toolbar,
  Typography,
} from "@mui/material";

import { useLocation, NavLink } from "react-router-dom";
import WindowIcon from "@mui/icons-material/Window";
import LoginComponent from "./components/loginComponent";
import MobileDrawer from "./components/MobileDrawer";
import NavButtons from "./components/NavButtons";
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
            <NavButtons links={filteredLinks} activeButton={activeButton} />
            <LoginComponent></LoginComponent>
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
}
