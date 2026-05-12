import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ActionSelect from "../../../src/sections/GeneralPurposeComponents/ActionSelect";

describe("ActionSelect Component", () => {
  const options = [
    { value: "1", label: "Opción 1" },
    { value: "2", label: "Opción 2" },
  ];

  it("renderiza el componente correctamente", () => {
    render(
      <ActionSelect value="" onChange={jest.fn()} options={options} />
    );

    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("ejecuta onChange al seleccionar una opción", () => {
    const handleChange = jest.fn();

    render(
      <ActionSelect value="" onChange={handleChange} options={options} />
    );

    fireEvent.mouseDown(screen.getByRole("combobox"));

    const option = screen.getByText("Opción 1");
    fireEvent.click(option);

    expect(handleChange).toHaveBeenCalled();
  });
});