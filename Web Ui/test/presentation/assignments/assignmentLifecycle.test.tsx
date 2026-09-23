import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import AssignmentDetail from '../../../src/presentation/assignments/pages/AssignmentDetail';

jest.mock('../../../src/modules/Assignments/application/GetAssignmentDetail', () => ({
  GetAssignmentDetail: jest.fn().mockImplementation(() => ({
    obtainAssignmentDetail: jest.fn().mockResolvedValue({
      id: 7, title: 'Tarea de TDD', groupid: 1, start_date: null, end_date: null,
    }),
  })),
}));
jest.mock('../../../src/modules/Groups/application/GetGroupDetail', () => ({
  GetGroupDetail: jest.fn().mockImplementation(() => ({
    obtainGroupDetail: jest.fn().mockResolvedValue({ groupName: 'Grupo A' }),
  })),
}));
jest.mock('../../../src/modules/FeatureFlags/application/GetFeatureFlagByName', () => ({
  GetFeatureFlagByName: jest.fn().mockImplementation(() => ({
    execute: jest.fn().mockResolvedValue({ is_enabled: false }),
  })),
}));

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

function mount(userid = 9) {
  return render(
    <MemoryRouter initialEntries={['/assignments/7']}>
      <Link to="/assignments/8">Otra tarea</Link>
      <Routes>
        <Route path="/assignments/:id" element={<AssignmentDetail role="student" userid={userid} />} />
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
