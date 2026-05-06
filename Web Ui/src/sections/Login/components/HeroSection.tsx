import logoTddLab from "../../../assets/logo-tddlab.svg";

export const HeroSection = () => (
  <header className="hero-section">
    <div className="hero-content">
      <img src={logoTddLab} alt="TDDLab Logo" className="hero-logo" />
      <p className="hero-description">
        Domina el desarrollo guiado por pruebas (Test-Driven Development) de manera práctica y eficiente. Una plataforma diseñada para elevar la calidad de tu código, reduciendo errores y optimizando tus ciclos de desarrollo desde el primer test.
      </p>
    </div>
  </header>
);