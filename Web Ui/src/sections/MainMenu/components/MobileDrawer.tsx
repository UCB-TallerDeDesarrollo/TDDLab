import { Drawer } from "@mui/material";
import { useState } from "react";
import NavLateralMenu from "./LateralMenu";
import { NavLink as NavLinkType } from "../../../types/navigation.types";
import { NavLink } from "react-router-dom";

interface MobileDrawerProps {
  navArrayLinks: NavLinkType[];
}

export default function MobileDrawer({ navArrayLinks }: Readonly<MobileDrawerProps>) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Drawer
        open={open}
        anchor="left"
        onClose={() => setOpen(false)}
        sx={{ display: { xs: "flex", sm: "none" } }}
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