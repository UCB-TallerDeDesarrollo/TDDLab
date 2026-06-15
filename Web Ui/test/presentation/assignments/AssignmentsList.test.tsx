import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AssignmentsList from "../../../src/presentation/assignments/components/AssignmentsList";
import { AssignmentListItemViewModel } from "../../../src/presentation/assignments/types/assignmentScreen";

jest.mock("../../../src/presentation/assignments/components/EditAssignmentForm", () => ({
  __esModule: true,
  default: () => <div>Formulario de edicion</div>,
}));

const assignments: AssignmentListItemViewModel[] = [
  {
    id: 1,
    title: "Tarea 1",
    description: "Descripcion 1",
    groupName: "Grupo 1",
    state: "pending",
  },
  {
    id: 2,
    title: "Tarea 2",
    description: "Descripcion 2",
    groupName: "Grupo 1",
    state: "delivered",
  },
];

describe("AssignmentsList", () => {
  it("renderiza las tareas recibidas", () => {
    render(<AssignmentsList assignments={assignments} userRole="teacher" />);

    expect(screen.getByText("Tarea 1")).toBeInTheDocument();
    expect(screen.getByText("Tarea 2")).toBeInTheDocument();
  });

  it("muestra acciones de gestion para teacher", () => {
    render(<AssignmentsList assignments={assignments} userRole="teacher" />);

    expect(screen.getAllByLabelText("edit")).toHaveLength(2);
    expect(screen.getAllByLabelText("delete")).toHaveLength(2);
  });

  it("oculta acciones de gestion para student", () => {
    render(<AssignmentsList assignments={assignments} userRole="student" />);

    expect(screen.queryByLabelText("edit")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("delete")).not.toBeInTheDocument();
    expect(screen.getAllByLabelText("see")).toHaveLength(2);
  });

  it("llama callbacks de ver y eliminar con el id de la tarea", () => {
    const handleClickDetail = jest.fn();
    const handleClickDelete = jest.fn();

    render(
      <AssignmentsList
        assignments={assignments}
        handleClickDelete={handleClickDelete}
        handleClickDetail={handleClickDetail}
        userRole="teacher"
      />,
    );

    fireEvent.click(screen.getAllByLabelText("see")[0]);
    fireEvent.click(screen.getAllByLabelText("delete")[0]);

    expect(handleClickDetail).toHaveBeenCalledWith(1);
    expect(handleClickDelete).toHaveBeenCalledWith(1);
  });

  it("renderiza dialogo de confirmacion cuando confirmationOpen esta activo", () => {
    const setConfirmationOpen = jest.fn();
    const handleConfirmDelete = jest.fn().mockResolvedValue(undefined);

    render(
      <AssignmentsList
        assignments={assignments}
        confirmationOpen
        handleConfirmDelete={handleConfirmDelete}
        setConfirmationOpen={setConfirmationOpen}
        userRole="teacher"
      />,
    );

    fireEvent.click(screen.getByText("Cancelar"));
    expect(setConfirmationOpen).toHaveBeenCalledWith(false);

    fireEvent.click(screen.getByText("Eliminar"));
    expect(handleConfirmDelete).toHaveBeenCalled();
  });

  it("renderiza mensaje de feedback cuando existe", () => {
    render(
      <AssignmentsList
        assignments={assignments}
        feedbackMessage="Tarea actualizada"
        feedbackSeverity="success"
        userRole="teacher"
      />,
    );

    expect(screen.getByText("Tarea actualizada")).toBeInTheDocument();
  });
});
