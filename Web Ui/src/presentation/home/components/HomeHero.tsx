import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

import TddIsotype from "./TddIsotype";
import TddWordmark from "./TddWordmark";

const HeroSection = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "379px 368px",
  alignItems: "center",
  columnGap: theme.spacing(12),
  maxWidth: 843,
  marginLeft: theme.spacing(15.75),
  marginTop: theme.spacing(8),
  [theme.breakpoints.down("lg")]: {
    marginLeft: 0,
    maxWidth: "100%",
    columnGap: theme.spacing(6),
  },
  [theme.breakpoints.down("md")]: {
    gridTemplateColumns: "1fr",
    justifyItems: "center",
    rowGap: theme.spacing(6),
    marginTop: theme.spacing(5),
  },
}));

function HomeHero() {
  return (
    <HeroSection>
      <TddIsotype />
      <TddWordmark />
    </HeroSection>
  );
}

export default HomeHero;
