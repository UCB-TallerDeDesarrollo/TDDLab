import { ReactNode } from "react";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

interface FeatureScreenLayoutProps {
  children: ReactNode;
  className?: string;
  testId?: string;
  sectionGap?: number;
}

const PageContainer = styled("main")(({ theme }) => ({
  width: "100%",
  boxSizing: "border-box",
  paddingTop: theme.spacing(7.625),
  paddingBottom: theme.spacing(5),
  backgroundColor: "#FFFFFF",
}));

const ScreenSection = styled(Box, {
  shouldForwardProp: (prop) => prop !== "sectionGap",
})<{ sectionGap?: number }>(({ theme, sectionGap }) => ({
  width: "100%",
  maxWidth: 1301,
  marginInline: "auto",
  display: "grid",
  gap: sectionGap === undefined ? theme.spacing(4.25) : theme.spacing(sectionGap),
}));

function FeatureScreenLayout({
  children,
  className,
  testId,
  sectionGap,
}: Readonly<FeatureScreenLayoutProps>) {
  return (
    <PageContainer>
      <ScreenSection
        className={className}
        data-testid={testId}
        sectionGap={sectionGap}
      >
        {children}
      </ScreenSection>
    </PageContainer>
  );
}

export default FeatureScreenLayout;
