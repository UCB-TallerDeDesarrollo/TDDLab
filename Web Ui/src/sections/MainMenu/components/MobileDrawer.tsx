import { Drawer, IconButton } from "@mui/material";
import { useState } from "react";
import NavLateralMenu from "./LateralMenu";
import { NavLink as NavLinkType } from "../../../types/navigation.types";
import { NavLink } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";

interface MobileDrawerProps {
  navArrayLinks: NavLinkType[];
}

export default function MobileDrawer({ navArrayLinks }: Readonly<MobileDrawerProps>) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton
        color="inherit"
        size="large"
        onClick={() => setOpen(true)}
        sx={{ display: { xs: "flex", md: "none" } }}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        open={open}
        anchor="left"
        onClose={() => setOpen(false)}
      >
        <NavLateralMenu
          navArrayLinks={navArrayLinks}
          NavLink={NavLink}
          setOpen={setOpen}
        />
      </Drawer>
    </>
  );
}