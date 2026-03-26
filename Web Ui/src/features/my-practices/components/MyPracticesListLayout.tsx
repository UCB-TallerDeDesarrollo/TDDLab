import { ReactNode } from "react";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

interface MyPracticesListLayoutProps {
  children: ReactNode;
}

const ListContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  display: "grid",
  gap: theme.spacing(1.5),
}));

function MyPracticesListLayout({
  children,
}: Readonly<MyPracticesListLayoutProps>) {
  return <ListContainer>{children}</ListContainer>;
}

export default MyPracticesListLayout;
