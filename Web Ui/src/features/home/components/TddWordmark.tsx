import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

const WordmarkContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  color: "#000000",
  [theme.breakpoints.down("md")]: {
    justifyContent: "center",
  },
}));

const TddText = styled("span")(({ theme }) => ({
  fontFamily: '"Palanquin Dark", "Inter", sans-serif',
  fontWeight: 800,
  fontSize: 164,
  lineHeight: 1,
  letterSpacing: 8,
  color: "#000000",
  [theme.breakpoints.down("lg")]: {
    fontSize: 128,
  },
  [theme.breakpoints.down("sm")]: {
    fontSize: 82,
    letterSpacing: 4,
  },
}));

const LabText = styled("span")(({ theme }) => ({
  writingMode: "vertical-rl",
  transform: "rotate(180deg)",
  fontFamily: '"Inter", sans-serif',
  fontSize: 78,
  fontWeight: 300,
  lineHeight: 1,
  letterSpacing: 2,
  color: "#000000",
  marginLeft: theme.spacing(1),
  [theme.breakpoints.down("lg")]: {
    fontSize: 62,
  },
  [theme.breakpoints.down("sm")]: {
    fontSize: 40,
  },
}));

function TddWordmark() {
  return (
    <WordmarkContainer aria-label="TDD Lab" role="img">
      <TddText>TDD</TddText>
      <LabText>LAB</LabText>
    </WordmarkContainer>
  );
}

export default TddWordmark;
