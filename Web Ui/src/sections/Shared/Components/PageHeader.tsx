import type { ReactNode } from "react";
import { styled } from "@mui/system";

interface PageHeaderProps {
  title: string;
  actions?: ReactNode;
  /** Defaults to 82% to match existing page layouts */
  width?: string | number;
}

const HeaderRoot = styled("div", {
  shouldForwardProp: (prop) => prop !== "width",
})<Pick<PageHeaderProps, "width">>(({ width }) => ({
  width: width ?? "82%",
  margin: "0 auto",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "16px",
  paddingTop: "6px",
  paddingBottom: "16px",
  borderBottom: "1px solid #D1D5DB",
}));

const HeaderTitle = styled("h2")({
  margin: 0,
  fontWeight: 700,
  fontSize: "24px",
});

export default function PageHeader({ title, actions, width }: Readonly<PageHeaderProps>) {
  return (
    <HeaderRoot width={width}>
      <HeaderTitle>{title}</HeaderTitle>
      {actions}
    </HeaderRoot>
  );
}
