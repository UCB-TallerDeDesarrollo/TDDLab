import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import "@testing-library/jest-dom";
import PracticeDetailPage from "../../../src/presentation/my-practices/pages/PracticeDetailPage";
import {
    fetchPracticeById,
    fetchSubmissionsByPracticeId,
    finishPracticeSubmission,
    startPracticeSubmission,
    updatePracticeRepositoryLink,
} from "../../../src/presentation/my-practices/services";

jest.mock("../../../src/presentation/my-practices/services", () => ({
    ...jest.requireActual("../../../src/presentation/my-practices/services"),
    fetchPracticeById: jest.fn(),
    fetchSubmissionsByPracticeId: jest.fn(),
    startPracticeSubmission: jest.fn(),
    finishPracticeSubmission: jest.fn(),
    updatePracticeRepositoryLink: jest.fn(),
}));

jest.setTimeout(10000);

const fetchPracticeMock = fetchPracticeById as jest.Mock;
const fetchSubmissionsMock = fetchSubmissionsByPracticeId as jest.Mock;
const startPracticeMock = startPracticeSubmission as jest.Mock;
const finishPracticeMock = finishPracticeSubmission as jest.Mock;

const STUDENT_ID = 9;
const PRACTICE_ID = 538;
const STATUS_NAME = "Estado de la práctica";
const LIFECYCLE_ACTION = /Iniciar práctica|Finalizar práctica/;

const practice = {
    id: PRACTICE_ID,
    title: "Prueba1",
    creation_date: "2026-09-23",
    userid: STUDENT_ID,
};

const started = {
    id: 42,
    practiceid: PRACTICE_ID,
    userid: STUDENT_ID,
    status: "in progress",
    repository_link: "https://github.com/student/practice",
    start_date: "2026-09-23",
    end_date: null,
    comment: null,
};

const delivered = {
    ...started,
    status: "delivered",
    end_date: "2026-09-24",
    comment: "Listo",
};

function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((res) => {
        resolve = res;
    });
    return { promise, resolve };
}

function GraphDestination() {
  return <output data-testid="graph-destination">{useLocation().search}</output>;
}

function mount(role = "student") {
    return render(
        <MemoryRouter initialEntries={[`/mis-practicas/${PRACTICE_ID}`]}>
            <Routes>
                <Route path="/graph" element={<GraphDestination />} />
                <Route
                    path="/mis-practicas/:id"
                    element={<PracticeDetailPage userid={STUDENT_ID} role={role} />}
                />
            </Routes>
        </MemoryRouter>
    );
}

function getStatus() {
    return screen.getByRole("status", { name: STATUS_NAME });
}

function getFirstAction() {
    return document.querySelector(".practice-student-actions")?.firstElementChild;
}

async function openStart() {
    fireEvent.click(await screen.findByRole("button", { name: "Iniciar práctica" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(within(dialog).getByRole("textbox", { name: "Enlace de Github" }), {
        target: { value: started.repository_link },
    });
    return dialog;
}

async function openFinish() {
    fireEvent.click(await screen.findByRole("button", { name: "Finalizar práctica" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(within(dialog).getByRole("textbox", { name: "Comentario" }), {
        target: { value: "Listo" },
    });
    return dialog;
}

describe("PracticeDetailPage - single lifecycle action (HU-03)", () => {
    beforeEach(() => {
        jest.resetAllMocks();
        fetchPracticeMock.mockResolvedValue(practice);
        fetchSubmissionsMock.mockResolvedValue([]);
        startPracticeMock.mockResolvedValue(undefined);
        finishPracticeMock.mockResolvedValue(undefined);
    });

    afterEach(() => jest.restoreAllMocks());

    // CA1
    it("shows only Iniciar práctica with a Pendiente badge for a practice not started", async () => {
        mount();

        expect(await screen.findByRole("button", { name: "Iniciar práctica" })).toBeEnabled();
        expect(screen.queryByRole("button", { name: "Finalizar práctica" })).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Ver gráfica" })).toBeDisabled();
        expect(getStatus()).toHaveTextContent("Pendiente");
        expect(getStatus()).toHaveClass("is-pending");
    });

    // CA2
    it("replaces Iniciar práctica with Finalizar práctica in the same place only after saving", async () => {
        const startSave = deferred<void>();
        startPracticeMock.mockReturnValueOnce(startSave.promise);
        fetchSubmissionsMock.mockResolvedValueOnce([]).mockResolvedValue([started]);
        mount();

        await screen.findByRole("button", { name: "Iniciar práctica" });
        expect(getFirstAction()).toHaveTextContent("Iniciar práctica");

        const dialog = await openStart();
        fireEvent.click(within(dialog).getByRole("button", { name: "Enviar" }));

        await waitFor(() =>
            expect(
                screen.getByRole("button", { name: "Iniciar práctica", hidden: true })
            ).toBeDisabled()
        );
        expect(startPracticeMock).toHaveBeenCalledTimes(1);
        expect(startPracticeMock).toHaveBeenCalledWith(
            expect.objectContaining({
                practiceid: PRACTICE_ID,
                userid: STUDENT_ID,
                status: "in progress",
                repository_link: started.repository_link,
            })
        );
        expect(
            screen.queryByRole("button", { name: "Finalizar práctica", hidden: true })
        ).not.toBeInTheDocument();

        await act(async () => {
            startSave.resolve();
        });

        expect(await screen.findByRole("button", { name: "Finalizar práctica" })).toBeEnabled();
        expect(screen.queryByRole("button", { name: "Iniciar práctica" })).not.toBeInTheDocument();
        expect(getFirstAction()).toHaveTextContent("Finalizar práctica");
        expect(getStatus()).toHaveTextContent("En progreso");
    });

    // CA3
    it("highlights an in-progress practice with the En progreso color", async () => {
        fetchSubmissionsMock.mockResolvedValue([started]);
        mount();

        expect(await screen.findByRole("button", { name: "Finalizar práctica" })).toBeEnabled();
        expect(screen.queryByRole("button", { name: "Iniciar práctica" })).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Ver gráfica" })).toBeEnabled();
        expect(getStatus()).toHaveTextContent("En progreso");
        expect(getStatus()).toHaveClass("is-progress");
    });

    // CA4
    it("finishing changes the status to Finalizado and removes the lifecycle action", async () => {
        fetchSubmissionsMock.mockResolvedValueOnce([started]).mockResolvedValue([delivered]);
        mount();

        const dialog = await openFinish();
        fireEvent.click(within(dialog).getByRole("button", { name: "Enviar" }));

        await waitFor(() => expect(finishPracticeMock).toHaveBeenCalledTimes(1));
        expect(finishPracticeMock).toHaveBeenCalledWith(
            started.id,
            expect.objectContaining({ id: started.id, status: "delivered", comment: "Listo" })
        );

        await waitFor(() => expect(getStatus()).toHaveTextContent("Finalizado"));
        expect(getStatus()).toHaveClass("is-finished");
        expect(screen.queryByRole("button", { name: LIFECYCLE_ACTION })).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Ver gráfica" })).toBeEnabled();
    });

    // CA5
    it("restores each saved state when the page is loaded again", async () => {
        fetchSubmissionsMock.mockResolvedValue([started]);
        const firstVisit = mount();

        expect(await screen.findByRole("button", { name: "Finalizar práctica" })).toBeEnabled();
        expect(getStatus()).toHaveTextContent("En progreso");
        firstVisit.unmount();

        fetchSubmissionsMock.mockResolvedValue([delivered]);
        mount();

        await waitFor(() => expect(getStatus()).toHaveTextContent("Finalizado"));
        expect(getStatus()).toHaveClass("is-finished");
        expect(screen.queryByRole("button", { name: LIFECYCLE_ACTION })).not.toBeInTheDocument();
    });

    it("does not offer a lifecycle action while the saved state is loading", async () => {
        const read = deferred<unknown[]>();
        fetchSubmissionsMock.mockReturnValueOnce(read.promise);
        mount();

        await screen.findByText("Prueba1");
        expect(screen.queryByRole("button", { name: LIFECYCLE_ACTION })).not.toBeInTheDocument();

        await act(async () => {
            read.resolve([started]);
        });

        expect(await screen.findByRole("button", { name: "Finalizar práctica" })).toBeEnabled();
    });

    it("does not offer to start again when the saved state cannot be loaded", async () => {
        const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
        fetchSubmissionsMock.mockRejectedValue(new Error("Network error"));
        mount();

        await screen.findByText("Prueba1");
        await waitFor(() =>
            expect(consoleError).toHaveBeenCalledWith(
                "Error fetching practice submissions:",
                expect.any(Error)
            )
        );
        expect(screen.queryByRole("button", { name: LIFECYCLE_ACTION })).not.toBeInTheDocument();
    });
});

describe("HU-05 student practice repository editing", () => {
    const updateMock = updatePracticeRepositoryLink as jest.Mock;
    const newLink = "https://github.com/student/corrected-practice";
    beforeEach(() => {
        jest.resetAllMocks();
        fetchPracticeMock.mockResolvedValue(practice);
        fetchSubmissionsMock.mockResolvedValue([started]);
        updateMock.mockResolvedValue({ ...started, repository_link: newLink });
    });
    afterEach(() => jest.restoreAllMocks());
    async function openEdit() {
        fireEvent.click(await screen.findByRole("button", { name: "Editar enlace del repositorio" }));
        return screen.getByRole("dialog");
    }

    it.each([started])("edits and restores the repository of a $status practice", async (submission) => {
        fetchSubmissionsMock.mockResolvedValue([submission]);
        updateMock.mockResolvedValue({ ...submission, repository_link: newLink });
        const view = mount();
        const dialog = await openEdit();
        expect(within(dialog).getByRole("textbox")).toHaveValue(submission.repository_link);
        fireEvent.change(within(dialog).getByRole("textbox"), { target: { value: newLink } });
        fireEvent.click(within(dialog).getByRole("button", { name: "Guardar" }));
        expect(await screen.findByRole("link", { name: newLink })).toBeInTheDocument();
        expect(updateMock).toHaveBeenCalledWith(submission.id, newLink);
        expect(startPracticeMock).not.toHaveBeenCalled();
        expect(finishPracticeMock).not.toHaveBeenCalled();
        expect(getStatus()).toHaveTextContent(submission.status === "delivered" ? "Finalizado" : "En progreso");
        expect(screen.queryByTestId("graph-destination")).not.toBeInTheDocument();
        view.unmount();
        fetchSubmissionsMock.mockResolvedValue([{ ...submission, repository_link: newLink }]);
        mount();
        expect(await screen.findByRole("link", { name: newLink })).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: /Ver gr/ }));
        expect(await screen.findByTestId("graph-destination")).toHaveTextContent("repoName=corrected-practice");
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it.each(["", "not-a-url", "https://evil.com/github.com/user/repo"])("rejects invalid URL %s", async (value) => {
        mount();
        const dialog = await openEdit();
        fireEvent.change(within(dialog).getByRole("textbox"), { target: { value } });
        expect(within(dialog).getByRole("button", { name: "Guardar" })).toBeDisabled();
        expect(within(dialog).getByText(/El enlace no puede|Enlace invalido/)).toBeInTheDocument();
        expect(updateMock).not.toHaveBeenCalled();
    });

    it("keeps the original URL on failure and permits retry", async () => {
        updateMock.mockRejectedValueOnce(new Error("Network error"));
        mount();
        const dialog = await openEdit();
        fireEvent.change(within(dialog).getByRole("textbox"), { target: { value: newLink } });
        fireEvent.click(within(dialog).getByRole("button", { name: "Guardar" }));
        expect(await within(dialog).findByRole("alert")).toHaveTextContent("No se pudo guardar el enlace");
        expect(screen.getByRole("link", { name: started.repository_link, hidden: true })).toBeInTheDocument();
        fireEvent.click(within(dialog).getByRole("button", { name: "Guardar" }));
        expect(await screen.findByRole("link", { name: newLink })).toBeInTheDocument();
    });

    it("cancels and restores the original draft when reopened", async () => {
        mount();
        const dialog = await openEdit();
        fireEvent.change(within(dialog).getByRole("textbox"), { target: { value: newLink } });
        fireEvent.click(within(dialog).getByRole("button", { name: "Cerrar" }));
        await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
        expect(within(await openEdit()).getByRole("textbox")).toHaveValue(started.repository_link);
        expect(updateMock).not.toHaveBeenCalled();
    });

    it.each(["teacher", "admin", ""])("hides the edit action for role %s", async (role) => {
        mount(role);
        await screen.findByRole("link", { name: started.repository_link });
        expect(screen.queryByRole("button", { name: "Editar enlace del repositorio" })).not.toBeInTheDocument();
    });

    it("hides editing on finalized practices", async () => {
        fetchSubmissionsMock.mockResolvedValue([delivered]);
        mount();
        await waitFor(() => expect(getStatus()).toHaveTextContent("Finalizado"));
        expect(screen.queryByRole("button", { name: "Editar enlace del repositorio" })).not.toBeInTheDocument();
    });

    it("saves an edited URL and the comment while finalizing the practice", async () => {
        const saved = { ...delivered, repository_link: newLink };
        fetchSubmissionsMock.mockResolvedValueOnce([started]).mockResolvedValue([saved]);
        finishPracticeMock.mockResolvedValue(undefined);
        const view = mount();
        const dialog = await openFinish();
        fireEvent.click(within(dialog).getByRole("button", { name: "edit" }));
        fireEvent.change(within(dialog).getByRole("textbox", { name: "Enlace del Repositorio" }), { target: { value: newLink } });
        fireEvent.click(within(dialog).getByRole("button", { name: "Enviar" }));
        expect(await screen.findByRole("link", { name: newLink })).toBeInTheDocument();
        expect(finishPracticeMock).toHaveBeenCalledWith(started.id,
            expect.objectContaining({ status: "delivered", comment: "Listo", repository_link: newLink }));
        expect(updateMock).not.toHaveBeenCalled();
        expect(getStatus()).toHaveTextContent("Finalizado");
        expect(screen.queryByRole("button", { name: "Editar enlace del repositorio" })).not.toBeInTheDocument();
        view.unmount();
        mount();
        expect(await screen.findByRole("link", { name: newLink })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Editar enlace del repositorio" })).not.toBeInTheDocument();
    });

    it("hides editing before starting a practice", async () => {
        fetchSubmissionsMock.mockResolvedValue([]);
        mount();
        await screen.findByRole("button", { name: /Iniciar/ });
        expect(screen.queryByRole("button", { name: "Editar enlace del repositorio" })).not.toBeInTheDocument();
    });
});
