import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

import FeatureScreenLayout from "../../../shared/components/FeatureScreenLayout";
import HomeFeatureAccess from "../components/HomeFeatureAccess";
import HomeHero from "../components/HomeHero";
import HomeWelcome from "../components/HomeWelcome";
import { useHomePage } from "../hooks/useHomePage";

const HomeContent = styled(Box)(({ theme }) => ({
  minHeight: "calc(100vh - 85px - 100px)",
  paddingTop: theme.spacing(5),
  [theme.breakpoints.down("md")]: {
    paddingTop: theme.spacing(2),
  },
}));

function HomePage() {
  const { greeting, availableLinks } = useHomePage();

  return (
    <FeatureScreenLayout className="HomePage" testId="home-page">
      <HomeContent>
        <HomeWelcome greeting={greeting} />
        <HomeHero />
        <HomeFeatureAccess links={availableLinks} />
      </HomeContent>
    </FeatureScreenLayout>
  );
}

export default HomePage;
