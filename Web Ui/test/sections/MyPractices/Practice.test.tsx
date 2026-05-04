import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Practice from "../../../src/sections/MyPractices/Practice";

jest.mock("../../../src/sections/MyPractices/EditPracticeForm", () => {
  return function MockEditPracticeForm() {
    return <div>Editar formulario</div>;
  };
});

// Mock de statusHelpers
jest.mock("../../../src/sections/Shared/statusHelpers", () => ({
  getStatusIcon: () => <span>status</span>,
  getStatusTooltipPractice: () => "Estado",
}));

describe("Practice Component", () => {
  const mockPractice = {
    id: 1,
    title: "Práctica Test",
    description: "Descripción Test",
    state: "pending",
    creation_date: new Date(),
    userid: 1,
  };

  const defaultProps = {
    practice: mockPractice,
    index: 0,
    handleClickDetail: jest.fn(),
    handleClickDelete: jest.fn(),
    handleRowHover: jest.fn(),
    isHovered: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza el título de la práctica", () => {
    render(
      <table>
        <tbody>
          <Practice {...defaultProps} />
        </tbody>
      </table>
    );

    expect(screen.getByText("Práctica Test")).toBeInTheDocument();
  });

  it("ejecuta handleClickDetail al hacer click en ver", () => {
    render(
      <table>
        <tbody>
          <Practice {...defaultProps} />
        </tbody>
      </table>
    );

    fireEvent.click(screen.getByLabelText("see"));

    expect(defaultProps.handleClickDetail).toHaveBeenCalledWith(0);
  });

  it("ejecuta handleClickDelete al hacer click en eliminar", () => {
    render(
      <table>
        <tbody>
          <Practice {...defaultProps} />
        </tbody>
      </table>
    );

    fireEvent.click(screen.getByLabelText("delete"));

    expect(defaultProps.handleClickDelete).toHaveBeenCalledWith(0);
  });

  it("abre el formulario de edición al hacer click en editar", () => {
    render(
      <table>
        <tbody>
          <Practice {...defaultProps} />
        </tbody>
      </table>
    );

    fireEvent.click(screen.getByLabelText("edit"));

    expect(screen.getByText("Editar formulario")).toBeInTheDocument();
  });
});