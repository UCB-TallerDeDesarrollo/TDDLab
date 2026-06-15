import { LANDING_INFO_CARDS } from "../constants/landingContent";
import "../styles/InfoCardsSection.css";

const HIGHLIGHTED_TERMS = ["Rojo", "Verde", "Refactorizar", "antes"];

function renderDescription(description: string) {
  const pattern = new RegExp(String.raw`\b(${HIGHLIGHTED_TERMS.join("|")})\b`, "g");

  return description.split(pattern).map((part) =>
    HIGHLIGHTED_TERMS.includes(part) ? (
      <strong key={`${part}-${description.indexOf(part)}`}>{part}</strong>
    ) : (
      part
    ),
  );
}

const InfoCardsSection = () => {
  return (
    <div className="cards-wrapper">
      {LANDING_INFO_CARDS.map((card) => (
        <div key={card.title} className={`card card--${card.tabAlign}`}>
          <div className="card-front">
            <div className="card-title">{card.title}</div>
          </div>

          <div className="card-hover">
            <div className="info-text">{renderDescription(card.description)}</div>
            <div className="icon-wrapper" aria-hidden="true">
              {card.iconPath ? (
                <img className="icon-image" src={card.iconPath} alt="" />
              ) : (
                <span className="icon-fallback">{card.icon}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InfoCardsSection;
