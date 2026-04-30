import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SubmissionTable } from "../../../src/sections/Assignments/components/SubmissionTable";
import type { SubmissionDataObject } from "../../../src/modules/Submissions/Domain/submissionInterfaces";

describe("SubmissionTable Component", () => {
  const baseSubmission: SubmissionDataObject = {
    id: 1,
    assignmentid: 4,
    userid: 7,
    status: "in progress",
    repository_link: "https://github.com/test/repo",
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-01-02"),
    comment: "",
  };

  const submissionWithoutLink: SubmissionDataObject = {
    id: 2,
    assignmentid: 4,
    userid: 8,
    status: "in progress",
    repository_link: "",
    start_date: new Date("2026-01-01"),
    end_date: null as unknown as Date,
    comment: "",
  };

  const studentEmails: Record<number, string> = {
    7: "student@test.com",
    8: "another@test.com",
  };

  const defaultProps = {
    submissions: [baseSubmission],
    studentEmails,
    disableAdditionalGraphs: false,
    showAdditionalGraphs: false,
    onViewGraph: jest.fn(),
    onOpenAssistant: jest.fn(),
    onViewAdditionalGraph: undefined as ((submission: SubmissionDataObject) => void) | undefined,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderSubmissionTable = (props = {}) => {
    return render(<SubmissionTable {...defaultProps} {...props} />);
  };

  it("render columnas base sin columna adicional cuando showAdditionalGraphs es false", () => {
    renderSubmissionTable();

    expect(screen.getByText("Correo")).toBeInTheDocument();
    expect(screen.getByText("Estado")).toBeInTheDocument();
    expect(screen.getByText("Enlace")).toBeInTheDocument();
    expect(screen.getByText("Fecha de Inicio")).toBeInTheDocument();
    expect(screen.getByText("Fecha de Finalización")).toBeInTheDocument();
    expect(screen.getByText("Grafica")).toBeInTheDocument();
    expect(screen.getByText("Asistente AI")).toBeInTheDocument();
    expect(screen.queryByText("Graficas Adicionales")).not.toBeInTheDocument();
  });

  it("render columna Graficas Adicionales cuando showAdditionalGraphs es true y onViewAdditionalGraph esta definido", () => {
    renderSubmissionTable({
      showAdditionalGraphs: true,
      onViewAdditionalGraph: jest.fn(),
    });

    expect(screen.getByText("Graficas Adicionales")).toBeInTheDocument();
  });

  it("NO render columna Graficas Adicionales cuando showAdditionalGraphs es true pero onViewAdditionalGraph no esta definido", () => {
    renderSubmissionTable({
      showAdditionalGraphs: true,
      onViewAdditionalGraph: undefined,
    });

    expect(screen.queryByText("Graficas Adicionales")).not.toBeInTheDocument();
  });

  it("render boton Graficas Adicionales deshabilitado cuando disableAdditionalGraphs es true", () => {
    const onViewAdditionalGraph = jest.fn();
    renderSubmissionTable({
      showAdditionalGraphs: true,
      onViewAdditionalGraph,
      disableAdditionalGraphs: true,
      submissions: [baseSubmission],
    });

    const button = screen.getByRole("button", { name: "Ver" });
    expect(button).toBeDisabled();
  });

  it("render botones Ver grafica y Asistente deshabilitados cuando submission no tiene repository_link", () => {
    renderSubmissionTable({
      submissions: [submissionWithoutLink],
    });

    const verGraficaButtons = screen.getAllByRole("button", { name: "Ver grafica" });
    const asistenteButtons = screen.getAllByRole("button", { name: "Asistente" });

    expect(verGraficaButtons[0]).toBeDisabled();
    expect(asistenteButtons[0]).toBeDisabled();
  });

  it("render email del estudiante usando studentEmails map por userid", () => {
    renderSubmissionTable();

    expect(screen.getByText("student@test.com")).toBeInTheDocument();
  });

  it("render N/A para fecha de finalizacion cuando end_date es null", () => {
    renderSubmissionTable({
      submissions: [submissionWithoutLink],
    });

    expect(screen.getByText("N/A")).toBeInTheDocument();
  });

  it("llama onViewGraph con la submission correcta al hacer clic en Ver grafica", () => {
    const onViewGraph = jest.fn();
    renderSubmissionTable({
      onViewGraph,
      submissions: [baseSubmission],
    });

    const verGraficaButton = screen.getByRole("button", { name: "Ver grafica" });
    verGraficaButton.click();

    expect(onViewGraph).toHaveBeenCalledTimes(1);
    expect(onViewGraph).toHaveBeenCalledWith(baseSubmission);
  });
});
