import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import AssignmentsList from "../../../src/sections/Assignments/components/AssignmentsList";
import { AssignmentDataObject } from "../../../src/modules/Assignments/domain/assignmentInterfaces";
import { GroupDataObject } from "../../../src/modules/Groups/domain/GroupInterface";
import { ASSIGNMENT_UPDATED_EVENT } from "../../../src/features/assignments/services/assignmentEvents";

const mockAssignmentsRepo = {
  getAssignmentsByGroupid: jest.fn(),
  getAssignments: jest.fn(),
  deleteAssignment: jest.fn(),
};

const mockGetGroups = {
  getGroups: jest.fn(),
  getGroupById: jest.fn(),
  getGroupsByUserId: jest.fn(),
};

const mockGroupsRepository = {
  getGroupById: jest.fn(),
};

const mockDeleteAssignment = {
  deleteAssignment: jest.fn(),
};

jest.mock(
  "../../../src/modules/Assignments/repository/AssignmentsRepository",
  () => ({
    __esModule: true,
    default: jest.fn(() => mockAssignmentsRepo),
  }),
);

jest.mock("../../../src/modules/Groups/repository/GroupsRepository", () => ({
  __esModule: true,
  default: jest.fn(() => mockGroupsRepository),
}));

jest.mock("../../../src/modules/Groups/application/GetGroups", () => ({
  __esModule: true,
  default: jest.fn(() => mockGetGroups),
}));

jest.mock(
  "../../../src/modules/Assignments/application/DeleteAssignment",
  () => ({
    __esModule: true,
    DeleteAssignment: jest.fn(() => mockDeleteAssignment),
  }),
);

jest.mock("../../../src/modules/User-Authentication/domain/authStates", () => ({
  useGlobalState: jest.fn(() => [
    {
      userid: 123,
      userRole: "teacher",
      usergroupid: 1,
    },
    jest.fn(),
  ]),
}));

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
});

Object.defineProperty(globalThis, "location", {
  value: {
    search: "",
  },
  writable: true,
});

const addEventListenerSpy = jest.spyOn(globalThis, "addEventListener");
const removeEventListenerSpy = jest.spyOn(globalThis, "removeEventListener");

describe("AssignmentsList Component", () => {
  const mockShowForm = jest.fn();
  const mockOnGroupChange = jest.fn();

  const mockAssignments: AssignmentDataObject[] = [
    {
      id: 1,
      title: "Tarea 1",
      description: "Descripción de la tarea 1",
      start_date: new Date("2024-01-01"),
      end_date: new Date("2024-01-15"),
      state: "pending",
      link: "https://github.com/test/repo1",
      comment: "Comentario 1",
      groupid: 1,
    },
    {
      id: 2,
      title: "Tarea 2",
      description: "Descripción de la tarea 2",
      start_date: new Date("2024-01-02"),
      end_date: new Date("2024-01-16"),
      state: "pending",
      link: "https://github.com/test/repo2",
      comment: "Comentario 2",
      groupid: 1,
    },
  ];

  const mockGroups: GroupDataObject[] = [
    {
      id: 1,
      groupName: "Grupo 1",
      groupDetail: "Descripción del grupo 1",
      creationDate: new Date(),
    },
    {
      id: 2,
      groupName: "Grupo 2",
      groupDetail: "Descripción del grupo 2",
      creationDate: new Date(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === "selectedGroup") return "1";
      return null;
    });
    globalThis.location.search = "";

    mockAssignmentsRepo.getAssignmentsByGroupid.mockResolvedValue(mockAssignments);
    mockAssignmentsRepo.getAssignments.mockResolvedValue(mockAssignments);
    mockDeleteAssignment.deleteAssignment.mockResolvedValue(undefined);

    mockGetGroups.getGroups.mockResolvedValue(mockGroups);
    mockGetGroups.getGroupById.mockImplementation((groupId: number) =>
      Promise.resolve(mockGroups.find((group) => group.id === groupId)),
    );
    mockGetGroups.getGroupsByUserId.mockResolvedValue([1, 2]);

    mockGroupsRepository.getGroupById.mockImplementation((groupId: number) =>
      Promise.resolve(mockGroups.find((group) => group.id === groupId)),
    );
  });

  const renderAssignmentsList = (props = {}) => {
    const defaultProps = {
      ShowForm: mockShowForm,
      userRole: "teacher",
      userGroupid: 1,
      onGroupChange: mockOnGroupChange,
      refreshToken: 0,
      ...props,
    };

    return render(
      <BrowserRouter>
        <AssignmentsList {...defaultProps} />
      </BrowserRouter>,
    );
  };

  it("debería mostrar el indicador de carga inicialmente", () => {
    renderAssignmentsList();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("debería mostrar la pantalla rediseñada con tareas", async () => {
    renderAssignmentsList();

    await waitFor(() => {
      expect(screen.getByText("Tareas")).toBeInTheDocument();
      expect(screen.getByText("Tarea 1")).toBeInTheDocument();
      expect(screen.getByText("Tarea 2")).toBeInTheDocument();
    });
  });

  it("debería mostrar el botón 'Crear' para teacher", async () => {
    renderAssignmentsList({ userRole: "teacher" });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /crear/i })).toBeInTheDocument();
    });
  });

  it("no debería mostrar el botón 'Crear' para estudiantes", async () => {
    renderAssignmentsList({ userRole: "student", userGroupid: [1, 2] });

    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /crear/i }),
      ).not.toBeInTheDocument();
    });
  });

  it("debería llamar a ShowForm cuando se hace clic en 'Crear'", async () => {
    renderAssignmentsList({ userRole: "teacher" });

    const createButton = await screen.findByRole("button", { name: /crear/i });
    fireEvent.click(createButton);

    expect(mockShowForm).toHaveBeenCalledTimes(1);
  });

  it("debería abrir el panel de filtros", async () => {
    renderAssignmentsList();

    const filterButton = await screen.findByRole("button", { name: /filtrar/i });
    fireEvent.click(filterButton);

    expect(await screen.findByLabelText("Grupo")).toBeInTheDocument();
    expect(screen.getByLabelText("Ordenar")).toBeInTheDocument();
  });

  it("debería mostrar estado vacío cuando no hay tareas", async () => {
    mockAssignmentsRepo.getAssignmentsByGroupid.mockResolvedValue([]);

    renderAssignmentsList();

    await waitFor(() => {
      expect(screen.getByText("No hay tareas disponibles")).toBeInTheDocument();
    });
  });

  it("debería mostrar estado de error cuando falla la carga", async () => {
    mockAssignmentsRepo.getAssignmentsByGroupid.mockRejectedValue(
      new Error("Error de red"),
    );

    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    renderAssignmentsList();

    await waitFor(() => {
      expect(
        screen.getByText("No se pudieron cargar las tareas"),
      ).toBeInTheDocument();
      expect(screen.getByText("Error de red")).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error fetching assignments by group ID:",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  it("debería cargar grupos para estudiantes usando sus ids disponibles", async () => {
    renderAssignmentsList({ userRole: "student", userGroupid: [1, 2] });

    await waitFor(() => {
      expect(mockGetGroups.getGroupById).toHaveBeenCalledWith(1);
      expect(mockGetGroups.getGroupById).toHaveBeenCalledWith(2);
    });
  });

  it("debería registrar listeners de actualización", async () => {
    renderAssignmentsList();

    await waitFor(() => {
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        ASSIGNMENT_UPDATED_EVENT,
        expect.any(Function),
      );
    });
  });

  it("debería poder eliminar una tarea", async () => {
    renderAssignmentsList();

    const deleteButtons = await screen.findAllByLabelText("delete");
    fireEvent.click(deleteButtons[0]);

    const confirmButton = await screen.findByText("Eliminar");
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockDeleteAssignment.deleteAssignment).toHaveBeenCalledWith(1);
    });
  });

  afterAll(() => {
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
});
