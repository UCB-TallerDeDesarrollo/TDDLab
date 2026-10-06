import { act, fireEvent, render, waitFor, screen, within } from "@testing-library/react";
import { Link, MemoryRouter, Route, Routes } from "react-router-dom";
import axios from "axios";
import "@testing-library/jest-dom";
import AssignmentDetail from "../../../src/presentation/assignments/pages/AssignmentDetail";
import { GitLinkDialog } from "../../../src/shared/components/GitHubLinkDialog";

jest.setTimeout(10000);

jest.mock('../../../src/modules/FeatureFlags/application/GetFeatureFlagByName', () => ({
  GetFeatureFlagByName: jest.fn().mockImplementation(() => ({
    execute: jest.fn().mockResolvedValue({ is_enabled: false }),
  })),
}));

jest.mock(
  "../../../src/modules/Assignments/application/GetAssignmentDetail",
  () => ({
    GetAssignmentDetail: jest.fn().mockImplementation(() => ({
      obtainAssignmentDetail: jest.fn().mockResolvedValue({
        title: "Test Assignment",
        description: "Test description",
        start_date: new Date(),
        end_date: new Date(),
        state: "pending",
        link: "https://github.com/test/test-repo",
        comment: "Test comment",
        groupid: 123,
      }),
    })),
  })
);

jest.mock("../../../src/modules/Groups/application/GetGroupDetail", () => ({
  GetGroupDetail: jest.fn().mockImplementation(() => ({
    obtainGroupDetail: jest.fn().mockResolvedValue({ groupName: "Test Group" }),
  })),
}));

jest.mock("../../../src/modules/Users/repository/UsersRepository", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    getUserById: jest.fn().mockImplementation((userid: number) =>
      Promise.resolve({
        email:
          userid === 123
            ? "student1@example.com"
            : userid === 124
              ? "student2@example.com"
              : "unknown@example.com",
      })
    ),
  })),
}));

jest.mock(
  "../../../src/modules/Submissions/Aplication/getSubmissionsByAssignmentId",
  () => ({
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
  })
);

describe("AssignmentDetail Component", () => {
  beforeEach(() => {
    jest.spyOn(axios, 'get').mockRejectedValue(notStarted);
  });
  afterEach(() => jest.restoreAllMocks());

  it("displays the group name", async () => {
    const { getByText } = mount(123, "student");

    await waitFor(() => {
      const groupName = getByText("Test Group");
      expect(groupName).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it("displays the Estado and Enlace sections for student role", async () => {
    const { getByText } = mount(123, "student");

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
    const { queryByText } = mount(123, "teacher");

    await waitFor(() => {
      const estado = queryByText("Estado:");
      expect(estado).not.toBeInTheDocument();
    });

    await waitFor(() => {
      const enlace = queryByText("Enlace:");
      expect(enlace).not.toBeInTheDocument();
    });
  });

  it("shows only the start lifecycle action when the task is pending", async () => {
    const { getByText } = mount(123, "student");

    await waitFor(() => {
      expect(getByText("Iniciar tarea")).toBeInTheDocument();
      expect(getByText("Ver gráfica")).toBeInTheDocument();
      expect(screen.queryByText("Finalizar tarea")).not.toBeInTheDocument();
    });
  });

  it("does not display 'Iniciar tarea', 'Ver gráfica', or 'Finalizar tarea' buttons for non-student roles", async () => {
    const { queryByText } = mount(123, "teacher");

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
    mount(123, "teacher");

    await waitFor(
      () => {
        expect(screen.getByText("Lista de entregas")).toBeInTheDocument();
        expect(screen.getByText("Enviado")).toBeInTheDocument();
        expect(screen.getByText("En progreso")).toBeInTheDocument();
        expect(screen.getByText("student1@example.com")).toBeInTheDocument();
        expect(screen.getByText("student2@example.com")).toBeInTheDocument();
        expect(
          screen.getByLabelText("Abrir repositorio de student1@example.com")
        ).toBeInTheDocument();
        expect(
          screen.getByLabelText("Abrir repositorio de student2@example.com")
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("shows loading indicator while fetching assignment details", async () => {
    const { getByTestId } = mount(123, "student");

    const loadingIndicator = getByTestId("loading-indicator");
    expect(loadingIndicator).toBeInTheDocument();
  });

  it("opens and closes the GitLinkDialog", async () => {
    const handleClose = jest.fn();
    const handleSend = jest.fn();

    const { getByText, getByRole } = render(
      <GitLinkDialog open={true} onClose={handleClose} onSend={handleSend} />
    );

    await waitFor(() => {
      expect(getByText(/Enviar/i)).toBeInTheDocument();
    });

    const closeButton = getByRole("button", { name: /Cerrar/i });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    const sendButton = getByRole("button", { name: /Enviar/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(handleSend).not.toHaveBeenCalled();
    });

    const input = getByRole("textbox", { name: /Enlace de Github/i });
    fireEvent.change(input, {
      target: { value: "https://github.com/test/repo" },
    });

    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(handleSend).toHaveBeenCalledTimes(1);
      expect(handleSend).toHaveBeenCalledWith("https://github.com/test/repo");
    });
  });
});

const started = {
  id: 42, assignmentid: 7, userid: 9, status: 'in progress',
  repository_link: 'https://github.com/student/task',
  start_date: '2026-09-23', end_date: null, comment: null,
};
const delivered = { ...started, status: 'delivered', end_date: '2026-09-24', comment: 'Listo' };
const notStarted = { isAxiosError: true, response: { status: 404 } };

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => { resolve = res; });
  return { promise, resolve };
}

function mount(userid = 9, role = "student") {
  return render(
    <MemoryRouter initialEntries={['/assignments/7']}>
      <Link to="/assignments/8">Otra tarea</Link>
      <Routes>
        <Route path="/assignments/:id" element={<AssignmentDetail role={role} userid={userid} />} />
      </Routes>
    </MemoryRouter>
  );
}

async function openStart() {
  fireEvent.click(await screen.findByRole('button', { name: 'Iniciar tarea' }));
  const dialog = screen.getByRole('dialog');
  fireEvent.change(within(dialog).getByRole('textbox', { name: 'Enlace de Github' }), {
    target: { value: started.repository_link },
  });
  return dialog;
}

async function openFinish() {
  fireEvent.click(await screen.findByRole('button', { name: 'Finalizar tarea' }));
  const dialog = screen.getByRole('dialog');
  fireEvent.change(within(dialog).getByRole('textbox', { name: 'Comentario' }), {
    target: { value: 'Listo' },
  });
  return dialog;
}

describe('single task lifecycle action', () => {
  let get: jest.SpyInstance;
  let post: jest.SpyInstance;
  let put: jest.SpyInstance;

  beforeEach(() => {
    get = jest.spyOn(axios, 'get').mockRejectedValue(notStarted);
    post = jest.spyOn(axios, 'post').mockResolvedValue({ status: 201, data: started });
    put = jest.spyOn(axios, 'put').mockResolvedValue({ status: 200, data: delivered });
  });
  afterEach(() => jest.restoreAllMocks());

  it('shows only Iniciar tarea for a task without a saved submission', async () => {
    mount();
    expect(await screen.findByRole('button', { name: 'Iniciar tarea' })).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'Finalizar tarea' })).not.toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Estado de la tarea' }))
      .toHaveTextContent('Pendiente');
    expect(screen.getByRole('status', { name: 'Estado de la tarea' })).toHaveClass('is-pending');
  });

  it('replaces the same button only after saving, then finishes and restores the saved state on re-entry', async () => {
    const startSave = deferred<{ status: number; data: typeof started }>();
    post.mockReturnValueOnce(startSave.promise);
    const view = mount();
    const dialog = await openStart();
    const originalAction = screen.getByRole('button', { name: 'Iniciar tarea', hidden: true });
    const send = within(dialog).getByRole('button', { name: 'Enviar' });
    fireEvent.click(send);
    fireEvent.click(send);
    expect(send).toBeDisabled();
    expect(originalAction).toBeDisabled();
    expect(screen.queryByText('Finalizar tarea')).not.toBeInTheDocument();
    expect(post).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith(expect.stringContaining('/submissions'),
      expect.objectContaining({ assignmentid: 7, userid: 9, status: 'in progress', repository_link: started.repository_link }),
      { withCredentials: true });

    await act(async () => { startSave.resolve({ status: 201, data: started }); });
    expect(await screen.findByRole('button', { name: 'Finalizar tarea' })).toBe(originalAction);
    expect(screen.queryByRole('button', { name: 'Iniciar tarea' })).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('En progreso');
    expect(screen.getByRole('status')).toHaveClass('is-progress');

    view.unmount();
    get.mockResolvedValue({ status: 200, data: started });
    const reloaded = mount();
    expect(await screen.findByRole('button', { name: 'Finalizar tarea' })).toBeEnabled();
    expect(screen.getByRole('status')).toHaveClass('is-progress');
    const finishSave = deferred<{ status: number; data: typeof delivered }>();
    put.mockReturnValueOnce(finishSave.promise);
    const finishDialog = await openFinish();
    const finishSend = within(finishDialog).getByRole('button', { name: 'Enviar' });
    fireEvent.click(finishSend);
    fireEvent.click(finishSend);
    expect(finishSend).toBeDisabled();
    expect(put).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.queryByText('Finalizado')).not.toBeInTheDocument();
    await act(async () => { finishSave.resolve({ status: 200, data: delivered }); });
    expect(await screen.findByRole('status')).toHaveTextContent('Finalizado');
    expect(screen.getByRole('status')).toHaveClass('is-finished');
    expect(screen.queryByRole('button', { name: /Iniciar tarea|Finalizar tarea/ })).not.toBeInTheDocument();
    expect(put).toHaveBeenCalledWith(expect.stringContaining('/submissions/42'),
      expect.objectContaining({ status: 'delivered', comment: 'Listo' }), { withCredentials: true });

    reloaded.unmount();
    get.mockResolvedValue({ status: 200, data: delivered });
    mount();
    expect(await screen.findByRole('status')).toHaveTextContent('Finalizado');
    expect(screen.getByRole('status')).toHaveClass('is-finished');
    expect(screen.queryByRole('button', { name: /Iniciar tarea|Finalizar tarea/ })).not.toBeInTheDocument();
  });

  it('does not offer an action or a pending status before the saved state loads', async () => {
    const read = deferred<{ status: number; data: typeof started }>();
    get.mockReturnValueOnce(read.promise);
    mount();
    expect(await screen.findByText('Cargando estado de la tarea...')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Iniciar tarea|Finalizar tarea/ })).not.toBeInTheDocument();
    expect(screen.queryByText('Pendiente')).not.toBeInTheDocument();
    await act(async () => { read.resolve({ status: 200, data: started }); });
    expect(await screen.findByRole('button', { name: 'Finalizar tarea' })).toBeEnabled();
  });

  it('shows a retry on read failure instead of offering to start again', async () => {
    get.mockRejectedValueOnce(new Error('Network error'));
    mount();
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar el estado');
    expect(screen.queryByRole('button', { name: /Iniciar tarea|Finalizar tarea/ })).not.toBeInTheDocument();
    get.mockResolvedValueOnce({ status: 200, data: delivered });
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Finalizado');
  });

  it('keeps the task pending on failed start and allows retrying the same dialog', async () => {
    post.mockRejectedValueOnce(new Error('Network error'));
    mount();
    const dialog = await openStart();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Enviar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo guardar el inicio');
    expect(screen.getByRole('button', { name: 'Iniciar tarea', hidden: true })).toBeEnabled();
    expect(screen.queryByText('Finalizar tarea')).not.toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Enviar' }));
    expect(await screen.findByRole('button', { name: 'Finalizar tarea' })).toBeEnabled();
    expect(post).toHaveBeenCalledTimes(2);
  });

  it('keeps the task in progress and the comment on failed completion', async () => {
    get.mockResolvedValue({ status: 200, data: started });
    put.mockRejectedValueOnce(new Error('Network error'));
    mount();
    const dialog = await openFinish();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Enviar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo finalizar');
    expect(within(dialog).getByRole('textbox', { name: 'Comentario' })).toHaveValue('Listo');
    expect(screen.getByRole('status', { hidden: true })).toHaveTextContent('En progreso');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Enviar' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Finalizado');
  });

  it('canceling start leaves the saved state unchanged', async () => {
    mount();
    const dialog = await openStart();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cerrar' }));
    expect(await screen.findByRole('button', { name: 'Iniciar tarea' })).toBeEnabled();
    expect(post).not.toHaveBeenCalled();
  });

  it('canceling completion leaves the task in progress', async () => {
    get.mockResolvedValue({ status: 200, data: started });
    mount();
    const dialog = await openFinish();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancelar' }));
    expect(await screen.findByRole('button', { name: 'Finalizar tarea' })).toBeEnabled();
    expect(screen.getByRole('status')).toHaveClass('is-progress');
    expect(put).not.toHaveBeenCalled();
  });

  it('does not query or start a task for an invalid user', async () => {
    mount(-1);
    await screen.findByRole('alert');
    expect(screen.queryByRole('button', { name: 'Iniciar tarea' })).not.toBeInTheDocument();
    expect(get).not.toHaveBeenCalled();
  });

  it('ignores a late response from a different task', async () => {
    const oldRead = deferred<{ status: number; data: typeof started }>();
    get.mockReturnValueOnce(oldRead.promise)
      .mockResolvedValueOnce({ status: 200, data: { ...delivered, assignmentid: 8 } });
    mount();
    await screen.findByText('Cargando estado de la tarea...');
    fireEvent.click(screen.getByRole('link', { name: 'Otra tarea' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Finalizado');
    await act(async () => { oldRead.resolve({ status: 200, data: started }); });
    await waitFor(() => expect(get).toHaveBeenLastCalledWith(
      expect.stringContaining('/submissions/8/9'), { withCredentials: true }
    ));
    expect(screen.getByRole('status')).toHaveTextContent('Finalizado');
    expect(screen.queryByRole('button', { name: 'Finalizar tarea' })).not.toBeInTheDocument();
  });
});
