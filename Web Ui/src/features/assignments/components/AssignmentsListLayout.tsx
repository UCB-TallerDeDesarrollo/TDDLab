import { ReactNode } from "react";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

interface AssignmentsListLayoutProps {
  children: ReactNode;
}

const ListContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  display: "grid",
  gap: theme.spacing(1.5),
}));

function AssignmentsListLayout({
  children,
}: Readonly<AssignmentsListLayoutProps>) {
  return <ListContainer>{children}</ListContainer>;
}

export default AssignmentsListLayout;
