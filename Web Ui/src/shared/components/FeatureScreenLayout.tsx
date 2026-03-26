import { ReactNode } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";

interface FeatureScreenLayoutProps {
  children: ReactNode;
  className?: string;
  testId?: string;
}

const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(7.625),
  paddingBottom: theme.spacing(5),
  backgroundColor: "#FFFFFF",
}));

const ScreenSection = styled(Box)(({ theme }) => ({
  width: "100%",
  maxWidth: 1301,
  marginInline: "auto",
  display: "grid",
  gap: theme.spacing(4.25),
}));

function FeatureScreenLayout({
  children,
  className,
  testId,
}: Readonly<FeatureScreenLayoutProps>) {
  return (
    <PageContainer>
      <ScreenSection className={className} data-testid={testId}>
        {children}
      </ScreenSection>
    </PageContainer>
  );
}

export default FeatureScreenLayout;
