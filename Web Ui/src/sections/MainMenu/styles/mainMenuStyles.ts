import { SxProps, Theme } from "@mui/material";

export const mainMenuStyles: Record<string, SxProps<Theme>> = {
  root: {
    width: { xs: "100%", md: 220 },
    height: { xs: "auto", md: "100vh" },
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: { xs: "row", md: "column" },
    boxShadow: { xs: "0 2px 8px rgba(0,0,0,0.08)", md: "2px 0 8px rgba(0,0,0,0.10)" },
    position: { xs: "sticky", md: "fixed" },
    left: 0,
    top: 0,
    zIndex: 1200,
    alignItems: { xs: "center", md: "stretch" },
    overflowX: { xs: "auto", md: "hidden" },
  },
  logoLink: {
    display: "flex",
    alignItems: "center",
    gap: 1,
    px: { xs: 1.5, md: 3 },
    py: { xs: 1.2, md: 3 },
    textDecoration: "none",
    color: "inherit",
    flexShrink: 0,
  },
  logoImage: {
    width: { xs: 34, md: 48 },
    height: { xs: 34, md: 48 },
  },
  list: {
    flexGrow: 1,
    px: 1,
    display: { xs: "flex", md: "block" },
    alignItems: "center",
    py: { xs: 0.5, md: 0 },
  },
  listItem: {
    mb: { xs: 0, md: 1.5 },
    mr: { xs: 0.5, md: 0 },
    flex: "0 0 auto",
  },
  listItemButton: {
    borderRadius: 2,
    color: "#1a1a2e",
    px: { xs: 1.25, md: 1.5 },
    minWidth: { xs: 120, md: "auto" },
    justifyContent: { xs: "center", md: "flex-start" },
    "&:hover": { backgroundColor: "#f0f4ff" },
    "& .MuiListItemIcon-root": {
      color: "inherit",
      minWidth: { xs: 32, md: 40 },
    },
  },
  loginWrapper: {
    px: { xs: 1, md: 2 },
    py: { xs: 0.75, md: 2 },
    flexShrink: 0,
  },
};
