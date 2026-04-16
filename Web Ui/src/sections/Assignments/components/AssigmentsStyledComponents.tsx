import { 
  TableCell,
} from "@mui/material";

import { StyledTable } from "../../Groups/components/WrappedStyledComponents";

import { styled } from "@mui/system";



const CustomTableCell1 = styled(TableCell)({
  width: "80%",
});

const LoadingContainer = styled("div")({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
});

const AssignmentsContainer = styled("div")({
  justifyContent: "center",
  alignItems: "center",
});

const FormsContainer = styled("div")({
  flex: "1",
  marginLeft: "8px",
  marginRight: "2px",
  marginTop: "68px",
});

export { StyledTable, CustomTableCell1, LoadingContainer, AssignmentsContainer, FormsContainer };
