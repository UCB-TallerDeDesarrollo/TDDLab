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
            justifyContent: "space-between",
            minHeight: "72px",
            paddingLeft: "72px",
            paddingRight: "32px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "row" }}>
            <MobileDrawer navArrayLinks={filteredLinks} />
            <NavLink to="/" style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center" }}>
              <TDDLabLogo />
            </NavLink>
          </div>
          <div
            style={{ display: "flex", flexDirection: "row", marginRight: "30px"}}>
            <NavButtons links={filteredLinks} activeButton={activeButton} />
            <LoginComponent></LoginComponent>
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
}
