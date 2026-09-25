import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import StartFinishActionButton from "../../../src/shared/components/StartFinishActionButton";

describe("StartFinishActionButton", () => {
  const onStart = jest.fn();
  const onFinish = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the start action for a pending submission", () => {
    render(
      <StartFinishActionButton
        status="pending"
        startLabel="Iniciar tarea"
        finishLabel="Finalizar tarea"
        onStart={onStart}
        onFinish={onFinish}
      />,
    );

    expect(
      screen.getByRole("button", { name: /iniciar tarea/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /finalizar tarea/i }),
    ).not.toBeInTheDocument();
  });

  it("renders the finish action for an in progress submission", () => {
    render(
      <StartFinishActionButton
        status="in progress"
        startLabel="Iniciar tarea"
        finishLabel="Finalizar tarea"
        onStart={onStart}
        onFinish={onFinish}
      />,
    );

    expect(
      screen.getByRole("button", { name: /finalizar tarea/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /iniciar tarea/i }),
    ).not.toBeInTheDocument();
  });

  it("renders nothing for a delivered submission (no reserved space)", () => {
    const { container } = render(
      <StartFinishActionButton
        status="delivered"
        startLabel="Iniciar tarea"
        finishLabel="Finalizar tarea"
        onStart={onStart}
        onFinish={onFinish}
      />,
    );

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole("button", { name: /iniciar/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /finalizar/i })).toBeNull();
  });

  it("never shows both start and finish actions at the same time", () => {
    const statuses: (string | undefined)[] = [
      "pending",
      "in progress",
      "delivered",
      undefined,
    ];

    statuses.forEach((status) => {
      const { unmount } = render(
        <StartFinishActionButton
          status={status}
          startLabel="Iniciar"
          finishLabel="Finalizar"
          onStart={onStart}
          onFinish={onFinish}
        />,
      );

      const startBtn = screen.queryByRole("button", { name: /iniciar/i });
      const finishBtn = screen.queryByRole("button", { name: /finalizar/i });
      expect(Boolean(startBtn) && Boolean(finishBtn)).toBe(false);
      unmount();
    });
  });

  it("calls onStart when the start button is clicked", () => {
    render(
      <StartFinishActionButton
        status="pending"
        startLabel="Iniciar tarea"
        finishLabel="Finalizar tarea"
        onStart={onStart}
        onFinish={onFinish}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /iniciar tarea/i }));
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onFinish).not.toHaveBeenCalled();
  });

  it("calls onFinish when the finish button is clicked", () => {
    render(
      <StartFinishActionButton
        status="in progress"
        startLabel="Iniciar tarea"
        finishLabel="Finalizar tarea"
        onStart={onStart}
        onFinish={onFinish}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /finalizar tarea/i }));
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(onStart).not.toHaveBeenCalled();
  });

  it("disables itself, shows a spinner and blocks clicks while loading", () => {
    render(
      <StartFinishActionButton
        status="pending"
        startLabel="Iniciar tarea"
        finishLabel="Finalizar tarea"
        onStart={onStart}
        onFinish={onFinish}
        loading
      />,
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(
      screen.getByRole("status", { name: /cargando/i }),
    ).toBeInTheDocument();

    fireEvent.click(button);
    expect(onStart).not.toHaveBeenCalled();
  });
});
