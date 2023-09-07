// src/App.tsx
import React from 'react';
import Card from './card';

function CardsView() {
  return (
    <React.Fragment >
      <h1>User Cards</h1>
      <div className="user-cards">
        <Card>
          <h3>John Doe</h3>
          <p>john@example.com</p>
        </Card>
        <Card>
          <h3>Jane Smith</h3>
          <p>jane@example.com</p>
        </Card>
      </div>
    </React.Fragment>
  );
}

export default CardsView;
