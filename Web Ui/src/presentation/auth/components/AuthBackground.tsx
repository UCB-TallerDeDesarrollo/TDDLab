import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";

const BackgroundContainer = styled(Box)({
  position: "fixed",
  width: "100vw",
  height: "100vh",
  top: 0,
  left: 0,
  zIndex: -1,
  overflow: "hidden",
  backgroundColor: "#FFFFFF",
});

const TopLeftImage = styled("img")({
  position: "absolute",
  width: "387px",
  height: "387px",
  left: "-80px",
  top: "0px",
  opacity: 0.6,
  objectFit: "contain",
  pointerEvents: "none",
});

const BottomRightImage = styled("img")({
  position: "absolute",
  width: "543px",
  height: "543px",
  right: "-40px", 
  bottom: "-40px", 
  opacity: 0.6,
  objectFit: "contain",
  pointerEvents: "none",
});

export const AuthBackground = () => (
  <BackgroundContainer>
    <TopLeftImage src="/isotipo1.png" alt="TDD Lab Pattern Top Left" />
    <BottomRightImage src="/isotipo2.png" alt="TDD Lab Pattern Bottom Right" />
  </BackgroundContainer>
);
