import "./styles/Login.css";
import { HeroSection } from "./components/HeroSection";
import { InfoCards } from "./components/InfoCards";
import { BenefitsSection } from "./components/BenefitsSection";
import { LandingFooter } from "./components/LandingFooter";

const LoginPage = () => {
  return (
    <div className="landing-wrapper">
      <HeroSection /> 
      <InfoCards />
      <BenefitsSection />
      <LandingFooter />
    </div>
  );
};

export default LoginPage;