import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

import TddIsotype from "./TddIsotype";
import TddWordmark from "./TddWordmark";

const HeroSection = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "367px minmax(320px, 1fr)",
  alignItems: "center",
  columnGap: theme.spacing(12),
  maxWidth: 880,
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

const IsotypeCard = styled(Box)(({ theme }) => ({
  width: 367,
  height: 367,
  borderRadius: 10,
  display: "grid",
  placeItems: "center",
  backgroundColor: "rgba(0, 0, 0, 0.004)",
  boxShadow: "-2px 4px 4px rgba(0, 0, 0, 0.25), 4px 2px 2px rgba(0, 0, 0, 0.12)",
  [theme.breakpoints.down("sm")]: {
    width: 280,
    height: 280,
  },
}));

function HomeHero() {
  return (
    <HeroSection>
      <IsotypeCard>
        <TddIsotype />
      </IsotypeCard>
      <TddWordmark />
    </HeroSection>
  );
}

export default HomeHero;
