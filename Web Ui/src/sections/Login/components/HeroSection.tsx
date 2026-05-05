import logoTddLab from "../../../assets/logo-tddlab.svg";

export const HeroSection = () => (
  <header className="hero-section">
    <div className="hero-content">
      <img src={logoTddLab} alt="TDDLab Logo" className="hero-logo" />
      <p className="hero-description">
        Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
        quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
      </p>
    </div>
  </header>
);