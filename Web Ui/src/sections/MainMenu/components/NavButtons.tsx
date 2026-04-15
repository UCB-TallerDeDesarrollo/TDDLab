import { Button, Box } from "@mui/material";
import { NavLink } from "react-router-dom";
import { NavLink as NavLinkType } from "../../../types/navigation.types";

interface NavButtonsProps {
  links: NavLinkType[];
  activeButton: string | undefined;
}

export default function NavButtons({ links, activeButton }: Readonly<NavButtonsProps>) {
  return (
    <Box sx={{ display: { xs: "none", sm: "block" } }}>
      {links.map((item) => (
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
  );
}