import { render, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import AssignmentDetail from "../../src/sections/Assignments/AssignmentDetail";

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

jest.mock("../../src/modules/Assignments/application/GetAssignmentDetail", () => ({
  // Mock de la función para obtener detalles de la tarea
  GetAssignmentDetail: jest.fn().mockImplementation(() => ({
    obtainAssignmentDetail: jest.fn().mockResolvedValue(mockAssignment),
  })),
}));

jest.mock("../../src/modules/Groups/application/GetGroupDetail", () => ({
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
});