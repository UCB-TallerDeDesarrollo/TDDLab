import {
  Table,
  Container,
} from "@mui/material";

import { styled } from "@mui/system";

const CenteredContainer = styled(Container)({
  justifyContent: "center",
  alignItems: "center",
});

const ButtonContainer = styled("div")({
  display: "flex",
  justifyContent: "flex-end",
  gap: "8px",
});

const StyledTable = styled(Table)({
  width: "82%",
  marginLeft: "auto",
  marginRight: "auto",
});


export { CenteredContainer,
  ButtonContainer,
  StyledTable}