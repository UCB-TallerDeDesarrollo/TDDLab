const MainMenuSX = {
    dFlexNoSm: { display: { xs: "flex", sm: "none" } },
    dNoneSmBlock: { display: { xs: "none", sm: "block" } },
    iconButton: { display: { xs: "flex", sm: "none" } },
    button: (activeButton: boolean | undefined) => ({
      borderBottom: activeButton ? "2px solid var(--color-surface)" : "none",
      color: activeButton ? "var(--color-surface)" : "var(--color-text-muted)",
    }),

    mobileDrawer: {
      "& .MuiDrawer-paper": {
        width: "220px",
        minHeight: "100dvh",
        height: "100dvh",
        boxSizing: "border-box",
        backgroundColor: "var(--color-surface)",
        overfloxY: "auto",
        borderRight: "none",
      }
    },

    sidebar: {
      width: "220px",
      minHeight: "100dvh",
      height: "100dvh",
      backgroundColor: "var(--color-surface)",
      display: "flex",
      flexDirection: "column",
      boxShadow: "var(--color-shadow-medium)",
      position: "fixed",
      left: 0,
      top: 0,
      zIndex: 1200,
      overflowY: "auto",
    },
    sidebarContent: {
      width: "100%",
      minHeight: "100%",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "var(--color-surface)",
      boxSizing: "border-box",
      flexGrow: 1,
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
      color: "var(--color-text-strong)",
    },
    logoLabLetter: {
      color: "var(--color-primary)",
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
      color: isActive ? "var(--color-primary)" : "var(--color-text-primary)",
      backgroundColor: isActive ? "var(--color-primary-soft)" : "transparent",
      "&:hover": {
        backgroundColor: "var(--color-surface-hover)",
      },
      "& .MuiListItemIcon-root": {
        color: isActive ? "var(--color-primary)" : "var(--color-text-primary)",
        minWidth: 40,
      },
    }),
    loginContainer: {
      px: 2,
      py: 2,
      mt: "auto",
    },
}

export default MainMenuSX;
