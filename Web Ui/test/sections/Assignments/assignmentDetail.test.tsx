import { render, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import AssignmentDetail from "../../../src/sections/Assignments/AssignmentDetail";

// Mock del estado de assignment
const mockAssignment = {
  title: "Test Assignment",
  description: "Test description",
  start_date: new Date(),
  end_date: new Date(),
  state: "pending",
  link: "https://github.com/test/test-repo",
  comment: "Test comment",
  groupid: 123, // ID del grupo
};

jest.mock(
  "../../../src/modules/Assignments/application/GetAssignmentDetail",
  () => ({
    // Mock de la función para obtener detalles de la tarea
    GetAssignmentDetail: jest.fn().mockImplementation(() => ({
      obtainAssignmentDetail: jest.fn().mockResolvedValue(mockAssignment),
    })),
  })
);

jest.mock("../../../src/modules/Groups/application/GetGroupDetail", () => ({
  // Mock de la función para obtener detalles del grupo
  GetGroupDetail: jest.fn().mockImplementation(() => ({
    obtainGroupDetail: jest.fn().mockResolvedValue({ groupName: "Test Group" }),
  })),
}));

describe("AssignmentDetail Component", () => {
  it("displays the group name", async () => {
    // Renderizar el componente con el role de estudiante
    const { getByText } = render(
      <BrowserRouter>
        <AssignmentDetail role="student" />
      </BrowserRouter>
    );

    // Esperar a que se muestre el nombre del grupo
    await waitFor(() => {
      const groupName = getByText("Test Group");
      expect(groupName).toBeInTheDocument();
    });
  });

  it("displays the Estado and Enlace sections for student role", async () => {
    const { getByText } = render(
      <BrowserRouter>
        <AssignmentDetail role="student" />
      </BrowserRouter>
    );

    await waitFor(() => {
      const estado = getByText("Estado:");
      expect(estado).toBeInTheDocument();
    });

    await waitFor(() => {
      const enlace = getByText("Enlace:");
      expect(enlace).toBeInTheDocument();
    });
  });

  it("does not display the Estado and Enlace sections for teacher roles", async () => {
    const { queryByText } = render(
      <BrowserRouter>
        <AssignmentDetail role="teacher" />
      </BrowserRouter>
    );

    await waitFor(() => {
      const estado = queryByText("Estado:");
      expect(estado).not.toBeInTheDocument();
    });

    await waitFor(() => {
      const enlace = queryByText("Enlace:");
      expect(enlace).not.toBeInTheDocument();
    });
  });

  it("displays 'Iniciar tarea', 'Ver gráfica', and 'Finalizar tarea' buttons for student role when task is pending", async () => {
    const { getByText } = render(
      <BrowserRouter>
        <AssignmentDetail role="student" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(getByText("Iniciar tarea")).toBeInTheDocument();
      expect(getByText("Ver gráfica")).toBeInTheDocument();
      expect(getByText("Finalizar tarea")).toBeInTheDocument();
    });

  });

  it("does not display 'Iniciar tarea', 'Ver gráfica', or 'Finalizar tarea' buttons for non-student roles", async () => {
    const { queryByText } = render(
      <BrowserRouter>
        <AssignmentDetail role="teacher" />
      </BrowserRouter>
    );

    await waitFor(() => {
      const iniciarTareaButton = queryByText("Iniciar tarea");
      const verGraficaButton = queryByText("Ver gráfica");
      const finalizarTareaButton = queryByText("Finalizar tarea");

      expect(iniciarTareaButton).not.toBeInTheDocument();
      expect(verGraficaButton).not.toBeInTheDocument();
      expect(finalizarTareaButton).not.toBeInTheDocument();
    });
  });
});
