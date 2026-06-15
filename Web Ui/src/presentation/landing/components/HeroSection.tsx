import ActionButton from "../../../shared/components/ActionButton";

type HeroSectionProps = {
  title: string;
  subtitle: string;
  buttonText: string;
  onAuthClick: () => void;
};

const HeroSection = ({
  title,
  subtitle,
  buttonText,
  onAuthClick,
}: HeroSectionProps) => {
  return (
    <section className="landing-hero" aria-label="Presentacion principal">
      <header className="landing-navbar">
        <img src="/landing/logo.svg" alt="Logo TDDLab" className="landing-logo" />
        <img src="/landing/linea.svg" alt="Linea decorativa" className="landing-navbar-line" />
      </header>

      <img
        src="/landing/intro-lineasZ.svg"
        alt="Decoracion izquierda"
        className="landing-z-line landing-z-line-left"
      />
      <img
        src="/landing/intro-lineasZ.svg"
        alt="Decoracion derecha"
        className="landing-z-line landing-z-line-right"
      />

      <div className="landing-hero-overlay">
        <div className="landing-intro-stack">
          <img src="/landing/intro.svg" alt="Ilustracion principal de TDDLab" className="landing-intro" />
          <img src="/landing/intro-lineasZ.svg" alt="Lineas decorativas del intro" className="landing-intro-lines" />
          <img src="/landing/intro-tddlab-center.svg" alt="Marca TDDLab en intro" className="landing-intro-brand" />
        </div>

        <ActionButton
          className="landing-action-button"
          onClick={onAuthClick}
          variantStyle="secondary"
        >
          {buttonText}
        </ActionButton>
      </div>

      <div className="landing-intro-copy">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </section>
  );
};

export default HeroSection;

