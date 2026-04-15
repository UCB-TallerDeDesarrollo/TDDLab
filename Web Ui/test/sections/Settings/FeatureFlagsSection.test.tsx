import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import FeatureFlagsSection from "../../../src/sections/Settings/components/FeatureFlagsSection";
import { FeatureFlag } from "../../../src/modules/FeatureFlags/domain/FeatureFlag";

const mockFlags: FeatureFlag[] = [
  { id: 1, feature_name: "Feature Alpha", is_enabled: true },
  { id: 2, feature_name: "Feature Beta", is_enabled: false },
];

describe("FeatureFlagsSection", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renderiza un Switch por cada flag", () => {
    render(<FeatureFlagsSection flags={mockFlags} onToggle={jest.fn()} />);
    const switches = screen.getAllByRole("checkbox");
    expect(switches).toHaveLength(mockFlags.length);
  });

  it("muestra el nombre de cada flag", () => {
    render(<FeatureFlagsSection flags={mockFlags} onToggle={jest.fn()} />);
    expect(screen.getByText("Feature Alpha")).toBeInTheDocument();
    expect(screen.getByText("Feature Beta")).toBeInTheDocument();
  });

  it("refleja el estado is_enabled en cada Switch", () => {
    render(<FeatureFlagsSection flags={mockFlags} onToggle={jest.fn()} />);
    const switches = screen.getAllByRole("checkbox") as HTMLInputElement[];
    expect(switches[0].checked).toBe(true);
    expect(switches[1].checked).toBe(false);
  });

  it("abre el diálogo de confirmación al cambiar un Switch", () => {
    render(<FeatureFlagsSection flags={mockFlags} onToggle={jest.fn()} />);
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    expect(screen.getByText("Cambiar funcionalidad")).toBeInTheDocument();
  });

  it("llama a onToggle con id y valor actual al confirmar", () => {
    const onToggle = jest.fn();
    render(<FeatureFlagsSection flags={mockFlags} onToggle={onToggle} />);
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    fireEvent.click(screen.getByText("Confirmar"));
    expect(onToggle).toHaveBeenCalledWith(1, true);
  });

  it("NO llama a onToggle al cancelar el diálogo", () => {
    const onToggle = jest.fn();
    render(<FeatureFlagsSection flags={mockFlags} onToggle={onToggle} />);
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    fireEvent.click(screen.getByText("Cancelar"));
    expect(onToggle).not.toHaveBeenCalled();
  });

});
