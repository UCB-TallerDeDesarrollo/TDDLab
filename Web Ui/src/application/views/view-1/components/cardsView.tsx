// src/App.tsx
import Card from './card';

function CardsView() {
  return (
    <>
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
    </>
  );
}

export default CardsView;
