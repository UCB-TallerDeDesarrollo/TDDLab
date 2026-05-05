import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import PracticeManager from "../../../src/sections/MyPractices/MyPracticesPage";

jest.mock("../../../src/sections/MyPractices/MyPracticesList", () => {
  return function MockPractices({ ShowForm }: { ShowForm: () => void }) {
    return <button onClick={ShowForm}>Abrir formulario</button>;
  };
});

jest.mock("../../../src/sections/MyPractices/MyPracticesForm", () => {
  return function MockMyPracticesForm() {
    return <div>Formulario de práctica</div>;
  };
});

describe("PracticeManager Component", () => {
  it("renderiza la lista de prácticas", () => {
    render(<PracticeManager userRole="student" userid={1} />);

    expect(screen.getByText("Abrir formulario")).toBeInTheDocument();
  });

  it("muestra el formulario al ejecutar ShowForm", () => {
    render(<PracticeManager userRole="student" userid={1} />);

    fireEvent.click(screen.getByText("Abrir formulario"));

    expect(screen.getByText("Formulario de práctica")).toBeInTheDocument();
  });
});