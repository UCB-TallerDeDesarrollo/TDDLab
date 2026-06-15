import ActionButton from "../../../shared/components/ActionButton";

type CTASectionProps = {
  title: string;
  subtitle: string;
  buttonText: string;
  onAuthClick: () => void;
};

const CTASection = ({ title, subtitle, buttonText, onAuthClick }: CTASectionProps) => {
  return (
    <section className="landing-cta" aria-label="Acceso a autenticacion">
      <img src="/landing/comienza-ahora.jpg" alt="Pantalla de codigo en fondo" className="landing-cta-bg" />
      <div className="landing-cta-content">
        <h2>{title}</h2>
        <p>{subtitle}</p>
        <ActionButton
          className="landing-action-button"
          onClick={onAuthClick}
          variantStyle="secondary"
        >
          {buttonText}
        </ActionButton>
      </div>
    </section>
  );
};

export default CTASection;

