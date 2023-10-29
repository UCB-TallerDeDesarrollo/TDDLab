import {
  Button,
  Box,
  Drawer,
  AppBar,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import NavLateralMenu from "./components/NavLateralMenu";
import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import { ReactElement } from "react";
import { NavLink } from "react-router-dom";

type NavLink = {
  title: string;
  path: string;
  icon:ReactElement;
};

interface NavbarProps {
  navArrayLinks: NavLink[];
}

export default function Navbar({navArrayLinks}:NavbarProps) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: "100px" }}>
      <AppBar
        position="fixed"
        sx={{ background: "#052845" }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            size="large"
            onClick={() => setOpen(true)}
            sx={{ display: { xs: "flex", sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1 }}
          >
            TDDLab
          </Typography>
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            {navArrayLinks.map((item) => (
              <Button
                color="inherit"
                key={item.title}
                component={NavLink}
                to={item.path}
              >
                {item.title}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>

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
    </div>
  );
}
