import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

import ContentState from "../../../shared/components/ContentState";
import FeatureScreenLayout from "../../../shared/components/FeatureScreenLayout";
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
  const { greeting, stateDescription, stateTitle, viewState } = useHomePage();

  if (viewState !== "success") {
    return (
      <FeatureScreenLayout className="HomePage" testId="home-page">
        <ContentState
          variant={viewState}
          title={stateTitle ?? "No se pudo cargar el inicio"}
          description={stateDescription}
        />
      </FeatureScreenLayout>
    );
  }

  return (
    <FeatureScreenLayout className="HomePage" testId="home-page">
      <HomeContent>
        <HomeWelcome
          greeting={greeting ?? "Hola usuario, bienvenido al TDD Lab!!!"}
        />
        <HomeHero />
      </HomeContent>
    </FeatureScreenLayout>
  );
}

export default HomePage;
