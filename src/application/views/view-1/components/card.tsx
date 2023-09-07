// src/Card.tsx
import React, { ReactNode } from 'react';
import { cardsPort } from '../useCases/cards.port';
interface CardProps {
  children: ReactNode;
}

const Card: React.FC<CardProps> = ({ children }) => {
    const port=new cardsPort()
    const handleCardClick=()=>{
        port.cardClick()
    }
  return (
    <div className="card" onClick={handleCardClick}>
      <div className="card-content">{children}</div>
    </div>
  );
};

export default Card;
