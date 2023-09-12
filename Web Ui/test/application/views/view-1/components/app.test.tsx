import Card from '../../../../../src/application/views/view-1/components/card';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';



test("displays the card correctly", () => {
  render(
    <Card>
      <h3>John Doe</h3>
      <p>john@example.com</p>
    </Card>
  );

  // Use assertions to check if the expected elements are present in the rendered output
  const nameElement = screen.getByText("John Doe");
  const emailElement = screen.getByText("john@example.com");

  expect(nameElement).toBeInTheDocument();
  expect(emailElement).toBeInTheDocument();
});