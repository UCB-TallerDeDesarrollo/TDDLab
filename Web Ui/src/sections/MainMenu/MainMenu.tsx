import { AppBar, Toolbar} from "@mui/material";
import { useLocation, NavLink } from "react-router-dom";
import LoginComponent from "./components/loginComponent";
import MobileDrawer from "./components/MobileDrawer";
import NavButtons from "./components/NavButtons";
import { NavLink as NavLinkType } from "../../types/navigation.types";
import { useFilteredNavLinks } from "../../hooks/useFilteredNavLinks";
import TDDLabLogo from "../../assets/TDDLabLogo";


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
      <AppBar position="fixed" color="primary">
        <Toolbar
          style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            minHeight: "72px",
            paddingLeft: "72px",
            paddingRight: "32px",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <MobileDrawer navArrayLinks={filteredLinks} />
            <NavLink to="/" style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center" }}>
              <TDDLabLogo />
            </NavLink>
          </div>
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end", gap: "8px" }}>
            <NavButtons links={filteredLinks} activeButton={activeButton} />
            <LoginComponent></LoginComponent>
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
}
