import { SxProps, Theme } from "@mui/material";

export const settingsLayoutStyles: Record<string, SxProps<Theme>> = {
  container: {
    width: "100%",
    maxWidth: "960px",
    mx: "auto",
    px: { xs: 2, md: 4 },
    py: { xs: 2, md: 4 },
  },
  sectionTitle: {
    fontWeight: 700,
    fontSize: { xs: "1.1rem", md: "1.25rem" },
    color: "#13213a",
    mb: 1,
  },
  sectionSubtitle: {
    color: "#52607a",
    mb: 3,
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    my: 4,
  },
  errorBox: {
    p: 2,
    bgcolor: "#ffebee",
    borderRadius: 1,
    mb: 4,
  },
  formControl: {
    mb: 2,
    width: "100%",
    maxWidth: "560px",
  },
  card: {
    p: { xs: 2, md: 3 },
    borderRadius: 2,
    border: "1px solid #dde3ef",
    backgroundColor: "#ffffff",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1300,
  },
  featureFlagRow: {
    display: "flex",
    alignItems: "center",
    gap: 1,
    py: 1,
    borderBottom: "1px solid #edf1f7",
    "&:last-of-type": {
      borderBottom: "none",
    },
  },
  checkboxLabel: {
    color: "#1a2942",
    fontWeight: 500,
  },
};
