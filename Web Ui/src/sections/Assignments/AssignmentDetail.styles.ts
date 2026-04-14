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
    maxWidth: "520px",
    border: "1px solid #BFBFBF",
    borderRadius: "6px",
  },
  cardContent: {
    padding: "20px 34px 18px",
  },
  detailsSection: {
    marginBottom: "20px",
  },
  assignmentTitle: {
    fontSize: "46px",
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
    fontSize: "38px",
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
