import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

const MarkWrapper = styled(Box)(({ theme }) => ({
  width: 230,
  height: 230,
  position: "relative",
  [theme.breakpoints.down("sm")]: {
    width: 180,
    height: 180,
  },
}));

const Diamond = styled(Box, {
  shouldForwardProp: (prop) => prop !== "tone",
})<{ tone: "blue" | "green" | "red" }>(({ tone, theme }) => ({
  position: "absolute",
  width: 39,
  height: 39,
  transform: "rotate(45deg)",
  borderRadius: 2,
  backgroundColor:
    tone === "blue" ? "#3B54A3" : tone === "green" ? "#6ABB46" : "#ED232A",
  [theme.breakpoints.down("sm")]: {
    width: 31,
    height: 31,
  },
}));

function TddIsotype() {
  return (
    <MarkWrapper aria-label="Isotipo TDD Lab" role="img">
      <Diamond tone="blue" sx={{ left: "42.5%", top: "18.5%" }} />
      <Diamond tone="blue" sx={{ left: "19.5%", top: "41.5%" }} />
      <Diamond tone="blue" sx={{ left: "65.5%", top: "41.5%" }} />
      <Diamond tone="blue" sx={{ left: "42.5%", top: "64.5%" }} />
      <Diamond tone="green" sx={{ left: "32.5%", top: "31.5%" }} />
      <Diamond tone="green" sx={{ left: "55.5%", top: "31.5%" }} />
      <Diamond tone="green" sx={{ left: "32.5%", top: "54.5%" }} />
      <Diamond tone="green" sx={{ left: "55.5%", top: "54.5%" }} />
      <Diamond tone="red" sx={{ left: "43.8%", top: "42.8%" }} />
    </MarkWrapper>
  );
}

export default TddIsotype;
