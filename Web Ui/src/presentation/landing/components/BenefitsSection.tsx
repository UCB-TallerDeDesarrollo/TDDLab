import { LandingBenefit } from "../constants/landingContent";

type BenefitsSectionProps = {
  title: string;
  benefits: LandingBenefit[];
};

const BenefitsSection = ({ title, benefits }: BenefitsSectionProps) => {
  return (
    <section className="landing-benefits" aria-label="Beneficios de la plataforma">
      <img
        src="/landing/circuitos-lateral-izquierdo.svg"
        alt="Circuito decorativo lateral izquierdo"
        className="landing-circuit-left"
      />
      <img
        src="/landing/circuitos-lateral-derecho.svg"
        alt="Circuito decorativo lateral derecho"
        className="landing-circuit-right"
      />

      <div className="landing-container">

        <h2 className="landing-section-title">{title}</h2>

        <ul className="landing-benefit-cards">
          {benefits.map((benefit) => (
            <li key={benefit.title} className="landing-benefit-card">
              <img src={benefit.imagePath} alt={benefit.imageAlt} />
              <h3>{benefit.title}</h3>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default BenefitsSection;

