import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import AssignmentDetail from "../../../src/sections/Assignments/AssignmentDetail";
import { GitLinkDialog } from "../../../src/sections/Assignments/components/GitHubLinkDialog"

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

jest.mock("../../../src/modules/Submissions/Aplication/getSubmissionsByAssignmentId", () => ({
  GetSubmissionsByAssignmentId: jest.fn().mockImplementation(() => ({
    getSubmissionsByAssignmentId: jest.fn().mockResolvedValue([
      {
        assignmentid: 1,
        userid: 123,
        status: "delivered",
        repository_link: "https://github.com/student/repo1",
        start_date: new Date(),
        end_date: new Date(),
        comment: "Good job",
      },
      {
        assignmentid: 1,
        userid: 124,
        status: "in progress",
        repository_link: "https://github.com/student/repo2",
        start_date: new Date(),
        end_date: null,
        comment: null,
      },
    ]),
  })),
}));

describe("AssignmentDetail Component", () => {
  it("displays the group name", async () => {
    // Renderizar el componente con el role de estudiante
    const { getByText } = render(
      <BrowserRouter>
        <AssignmentDetail role="student" userid={123}/>
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
        <AssignmentDetail role="student" userid={123} />
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
        <AssignmentDetail role="teacher" userid={123}/>
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
        <AssignmentDetail role="student" userid={123}/>
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
        <AssignmentDetail role="teacher" userid={123}/>
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

  it("displays the list of submissions for teacher role", async () => {
    render(
      <BrowserRouter>
        <AssignmentDetail role="teacher" userid={123} />
      </BrowserRouter>
    );

    // await waitFor(() => {
    //   expect(getByText("Lista de Estudiantes")).toBeInTheDocument();
    //   expect(getByText("Enviado")).toBeInTheDocument();
    //   expect(getByText("En progreso")).toBeInTheDocument();
    //   expect(getByText("https://github.com/student/repo1")).toBeInTheDocument();
    //   expect(getByText("https://github.com/student/repo2")).toBeInTheDocument();
    // });
    await waitFor(() => {
      expect(screen.getByText("Lista de Estudiantes")).toBeInTheDocument();
      const enviado = screen.queryByText("Enviado");
      const enProgreso = screen.queryByText("En progreso");
      expect(enviado).toBeInTheDocument();
      expect(enProgreso).toBeInTheDocument();
    });
  });

  it("shows loading indicator while fetching assignment details", async () => {
    const { getByTestId } = render(
      <BrowserRouter>
        <AssignmentDetail role="student" userid={123} />
      </BrowserRouter>
    );

    const loadingIndicator = getByTestId("loading-indicator");
    expect(loadingIndicator).toBeInTheDocument();
  });

  it('opens and closes the GitLinkDialog', async () => {
    // Simular las funciones onClose y onSend
    const handleClose = jest.fn();
    const handleSend = jest.fn();

    // Renderizar el componente con el diálogo abierto
    const { getByText, getByRole } = render(
        <GitLinkDialog
            open={true}
            onClose={handleClose}
            onSend={handleSend}
        />
    );

    // Verificar que el diálogo esté en el DOM
    await waitFor(() => {
        expect(getByText(/Enviar/i)).toBeInTheDocument();
    });

    // Simular el cierre del diálogo
    const closeButton = getByRole('button', { name: /Cerrar/i });
    fireEvent.click(closeButton);

    // Verificar que handleClose haya sido llamado
    await waitFor(() => {
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    // Simular el envío del enlace de GitHub
    const sendButton = getByRole('button', { name: /Enviar/i });
    fireEvent.click(sendButton);

    // Verificar que handleSend no se haya llamado debido a que el link es vacío
    await waitFor(() => {
        expect(handleSend).not.toHaveBeenCalled();
    });

    // Simular la entrada de un enlace válido
    const input = getByRole('textbox', { name: /Enlace de Github/i });
    fireEvent.change(input, { target: { value: 'https://github.com/test/repo' } });

    // Volver a intentar el envío del enlace de GitHub
    fireEvent.click(sendButton);

    // Verificar que handleSend haya sido llamado esta vez
    await waitFor(() => {
        expect(handleSend).toHaveBeenCalledTimes(1);
        expect(handleSend).toHaveBeenCalledWith('https://github.com/test/repo');
    });
  });

});
