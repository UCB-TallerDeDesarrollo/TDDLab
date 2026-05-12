import type { CSSProperties } from "react";

export const assignmentDetailStyles: Record<string, CSSProperties> = {
  pageContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    gap: "24px",
    padding: "20px 0",
  },
  card: {
    width: "100%",
    maxWidth: "440px",
    border: "1px solid #BFBFBF",
    borderRadius: "6px",
  },
  cardContent: {
    padding: "18px 28px 16px",
  },
  detailsSection: {
    marginBottom: "20px",
  },
  assignmentTitle: {
    // Match legacy UI scale while keeping current typography
    fontSize: "clamp(28px, 3.2vw, 36px)",
    fontWeight: 700,
    lineHeight: 1.1,
    marginBottom: "20px",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "250px",
  },
  adminContainer: {
    width: "96%",
    maxWidth: "1260px",
  },
  adminTitle: {
    fontSize: "clamp(26px, 2.6vw, 32px)",
    fontWeight: 700,
    marginBottom: "8px",
  },
  tableLoadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "150px",
  },
};

export const assignmentDetailSx = {
  metaIcon: { color: "#7A7A7A", fontSize: 22 },
  secondaryIcon: { color: "#666666" },
  metaText: { fontSize: "clamp(16px, 1.6vw, 20px)", lineHeight: 1.45 },
  secondaryText: { fontSize: "16px", lineHeight: "1.8" },
  compactRow: { mb: 1 },
};
