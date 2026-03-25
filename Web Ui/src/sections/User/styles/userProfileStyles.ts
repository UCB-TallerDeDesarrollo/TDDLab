import { SxProps, Theme } from "@mui/material";

export const userProfileStyles: Record<string, SxProps<Theme>> = {
  page: {
    width: "100%",
    minHeight: "100%",
    px: { xs: 2, md: 4 },
    py: 3,
    backgroundColor: "#ffffff",
  },
  headerGrid: {
    display: "grid",
    gridTemplateColumns: { xs: "1fr", md: "1fr auto" },
    gap: { xs: 2.5, md: 4 },
    alignItems: "start",
  },
  title: {
    fontSize: { xs: "1.8rem", md: "3rem" },
    fontWeight: 700,
    lineHeight: 1.05,
    color: "#111",
    wordBreak: "break-word",
  },
  subtitle: {
    mt: 1,
    fontSize: { xs: "1rem", md: "1.8rem" },
    color: "#222",
    wordBreak: "break-word",
  },
  detailsGrid: {
    mt: 4,
    display: "grid",
    gridTemplateColumns: { xs: "1fr", sm: "auto 1fr" },
    columnGap: 3,
    rowGap: 1.5,
    maxWidth: 640,
  },
  editButton: {
    mt: 3,
    borderRadius: 1,
    textTransform: "none",
    px: 3,
    backgroundColor: "#69be4b",
    "&:hover": { backgroundColor: "#58a73c" },
  },
  avatarWrapper: {
    display: "flex",
    justifyContent: { xs: "center", md: "flex-end" },
    mt: { xs: 1, md: 0 },
    pr: { xs: 0, md: 1 },
  },
  avatar: {
    width: { xs: 132, md: 240 },
    height: { xs: 132, md: 240 },
    border: "10px solid #d7d3ce",
    bgcolor: "#c7d6e5",
  },
  groupsTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    flexWrap: "wrap",
  },
  groupsTitle: {
    fontSize: { xs: "1.4rem", md: "2rem" },
    fontWeight: 700,
    color: "#1b1b1b",
  },
  groupsDivider: {
    flex: 1,
    minWidth: 120,
    height: 3,
    borderRadius: 999,
    background: "linear-gradient(90deg, #d5dbe8 0%, #cfe6cf 55%, #f5c6cc 100%)",
  },
};
