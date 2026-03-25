import { Container, Table } from "@mui/material";
import { styled } from "@mui/system";

export const CenteredContainer = styled(Container)({
  justifyContent: "center",
  alignItems: "center",
});

export const ButtonContainer = styled("div")({
  display: "flex",
  justifyContent: "flex-end",
  gap: "8px",
});

export const StyledTable = styled(Table)({
  width: "100%",
  maxWidth: "1100px",
  marginLeft: "auto",
  marginRight: "auto",
});

export const groupPageStyles = {
  headRow: { borderBottom: "2px solid #E7E7E7" },
  headCell: { fontWeight: 560, color: "#333", fontSize: "1rem" },
  createButton: { borderRadius: "17px", textTransform: "none", fontSize: "0.95rem" },
  collapseCell: { width: "100%", padding: 0, margin: 0 },
  collapseWrapper: { boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)", borderRadius: "2px" },
  collapseContent: { padding: "20px 24px" },
};
