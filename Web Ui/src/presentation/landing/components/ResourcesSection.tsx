import { LandingResource } from "../constants/landingContent";

type ResourcesSectionProps = {
  title: string;
  resources: LandingResource[];
};

const ResourcesSection = ({ title, resources }: ResourcesSectionProps) => {
  return (
    <section className="landing-resources" aria-label="Recursos destacados">
      <div className="landing-container">
        <h2 className="landing-section-title">{title}</h2>

        <div className="landing-resource-grid">
          <img src={resources[0].imagePath} alt={resources[0].imageAlt} className="resource-large" />
          <img src={resources[1].imagePath} alt={resources[1].imageAlt} className="resource-small-top" />
          <img src={resources[2].imagePath} alt={resources[2].imageAlt} className="resource-small-bottom" />
          <img src={resources[3].imagePath} alt={resources[3].imageAlt} className="resource-bottom-left" />
          <img src={resources[4].imagePath} alt={resources[4].imageAlt} className="resource-bottom-right" />
        </div>
      </div>
    </section>
  );
};

export default ResourcesSection;

