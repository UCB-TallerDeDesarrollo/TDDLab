

import {
  Table,  Container,
} from "@mui/material";

import { styled } from "@mui/system";
import "./UserPage.variables.css";
import "./UserPage.css";

// -------------------  ESTILOS  -------------------


const CenteredContainer = styled(Container)({
  justifyContent: "center",
  alignItems: "center",
  marginTop: "20px",
  paddingBottom: "20px",
});

const StyledTable = styled(Table)({
  width: "90%",
  marginLeft: "auto",
  marginRight: "auto",
  marginTop: "4px",
  borderCollapse: "collapse",
  tableLayout: "fixed",
  backgroundColor: "var(--users-table-bg)",
});

const FilterContainer = styled("div")({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginTop: "20px",
  marginBottom: "20px",
  gap: "20px",
});

export { CenteredContainer, StyledTable, FilterContainer };