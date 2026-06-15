import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";

const HeaderContainer = styled(Box)({
  width: "100%",
  height: "113px",
  backgroundColor: "#002346",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

export const AuthHeader = () => (
  <HeaderContainer>
    <img 
      src="/landing/logo.svg" 
      alt="TDD Lab Logo" 
      style={{ height: "70px", objectFit: "contain" }} 
    />
  </HeaderContainer>
);
