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

export { StyledTable, CustomTableCell1, LoadingContainer };
