const MainMenuSX = {
    dFlexNoSm: { display: { xs: "flex", sm: "none" } },
    dNoneSmBlock: { display: { xs: "none", sm: "block" } },
    iconButton: { display: { xs: "flex", sm: "none" } },
    button: (activeButton: boolean | undefined) => ({
      borderBottom: activeButton ? "2px solid #fff" : "none",
      color: activeButton ? "#fff" : "#A9A9A9",
    }),

    sidebar: {
      width: 220,
      height: "100vh",
      backgroundColor: "#fff",
      display: "flex",
      flexDirection: "column",
      boxShadow: "2px 0 8px rgba(0,0,0,0.10)",
      position: "fixed",
      left: 0,
      top: 0,
      zIndex: 1200,
    },
    logoLink: {
      display: "flex",
      alignItems: "center",
      gap: 1,
      px: 3,
      py: 3,
      textDecoration: "none",
      color: "inherit",
    },
    logoTextContainer: {
      display: "flex",
      flexDirection: "column",
      lineHeight: 2,
    },
    logoLetterRow: {
      display: "flex",
      justifyContent: "space-between",
      width: "100%",
    },
    logoTddLetter: {
      color: "#000000",
    },
    logoLabLetter: {
      color: "#1565c0",
    },
    navList: {
      flexGrow: 1,
      px: 1,
    },
    navListItem: {
      mb: 4,
    },
    navListItemButton: (isActive: boolean) => ({
      borderRadius: 2,
      color: isActive ? "#1565c0" : "#1a1a2e",
      backgroundColor: isActive ? "#e8f0fe" : "transparent",
      "&:hover": {
        backgroundColor: "#f0f4ff",
      },
      "& .MuiListItemIcon-root": {
        color: isActive ? "#1565c0" : "#1a1a2e",
        minWidth: 40,
      },
    }),
    loginContainer: {
      px: 2,
      py: 2,
    },
}

export default MainMenuSX;
