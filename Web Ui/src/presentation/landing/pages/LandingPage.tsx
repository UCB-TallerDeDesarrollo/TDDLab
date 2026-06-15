import HeroSection from "../components/HeroSection";
import BenefitsSection from "../components/BenefitsSection";
import InfoCardsSection from "../components/InfoCardsSection";
import ResourcesSection from "../components/ResourcesSection";
import CTASection from "../components/CTASection";
import FooterSection from "../components/FooterSection";
import {
  LANDING_BENEFITS,
  LANDING_COPY,
  LANDING_RESOURCES,
} from "../constants/landingContent";
import { useLanding } from "../hooks/useLanding";
import "../styles/Landing.css";
import "../styles/CardAnimations.css";

const LandingPage = () => {
  const { goToAuth } = useLanding();

  return (
    <main className="landing-page">
      <HeroSection
        title={LANDING_COPY.heroTitle}
        subtitle={LANDING_COPY.heroSubtitle}
        buttonText={LANDING_COPY.heroButtonText}
        onAuthClick={goToAuth}
      />

      <InfoCardsSection />

      <BenefitsSection
        title={LANDING_COPY.benefitsTitle}
        benefits={LANDING_BENEFITS}
      />

      <ResourcesSection title={LANDING_COPY.resourcesTitle} resources={LANDING_RESOURCES} />

      <CTASection
        title={LANDING_COPY.ctaTitle}
        subtitle={LANDING_COPY.ctaSubtitle}
        buttonText={LANDING_COPY.authButtonText}
        onAuthClick={goToAuth}
      />

      <FooterSection />
    </main>
  );
};

export default LandingPage;

