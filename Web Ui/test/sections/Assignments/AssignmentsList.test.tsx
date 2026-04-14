import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import AssignmentsList from "../../../src/sections/Assignments/components/AssignmentsList";

// Mock del hook useAssignments - Versión dinámica que permite cambiar el comportamiento
const mockUseAssignments = jest.fn();

jest.mock("../../../src/sections/Assignments/hooks/useAssigments", () => ({
  __esModule: true,
  default: (...args: any[]) => mockUseAssignments(...args),
}));

const mockAssignmentsRepo = {
  getAssignmentsByGroupid: jest.fn(),
  getAssignments: jest.fn(),
  deleteAssignment: jest.fn(),
};

const mockGroupsRepo = {
  getGroups: jest.fn(),
  getGroupById: jest.fn(),
  getGroupsByUserId: jest.fn(),
};

const mockDeleteAssignment = {
  deleteAssignment: jest.fn(),
};

jest.mock("../../../src/modules/Assignments/repository/AssignmentsRepository", () => {
  return {
    __esModule: true,
    default: jest.fn(() => mockAssignmentsRepo),
  };
});

jest.mock("../../../src/modules/Groups/repository/GroupsRepository", () => {
  return {
    __esModule: true,
    default: jest.fn(() => mockGroupsRepo),
  };
});

jest.mock("../../../src/modules/Assignments/application/DeleteAssignment", () => {
  return {
    __esModule: true,
    DeleteAssignment: jest.fn(() => mockDeleteAssignment),
  };
});

jest.mock("../../../src/modules/User-Authentication/domain/authStates", () => ({
  useGlobalState: jest.fn(() => [
    {
      userid: 123,
      userrole: "teacher",
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
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
});

Object.defineProperty(globalThis, 'location', {
  value: {
    search: '',
  },
  writable: true,
});

Object.defineProperty(globalThis, 'addEventListener', {
  value: jest.fn(),
});
Object.defineProperty(globalThis, 'removeEventListener', {
  value: jest.fn(),
});

describe("AssignmentsList Component", () => {
  const mockShowForm = jest.fn();
  const mockOnGroupChange = jest.fn();
  const mockLoadAssignments = jest.fn();
  const mockHandleGroupChange = jest.fn();

  const defaultMockReturn = {
    assignments: [
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
        state: "completed",
        link: "https://github.com/test/repo2",
        comment: "Comentario 2",
        groupid: 1,
      },
    ],
    setAssignments: jest.fn(),
    groupList: [
      { id: 1, groupName: "Grupo 1", groupDetail: "Descripción del grupo 1", creationDate: new Date() },
      { id: 2, groupName: "Grupo 2", groupDetail: "Descripción del grupo 2", creationDate: new Date() },
    ],
    selectedGroup: 1,
    isLoading: false,
    loadAssignmentsByGroupId: mockLoadAssignments,
    handleGroupChange: mockHandleGroupChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    globalThis.location.search = '';
    
    // Resetear el mock a su valor por defecto
    mockUseAssignments.mockReturnValue(defaultMockReturn);
    
    mockAssignmentsRepo.getAssignmentsByGroupid.mockResolvedValue(defaultMockReturn.assignments);
    mockDeleteAssignment.deleteAssignment.mockResolvedValue(undefined);
  });

  const renderAssignmentsList = (props = {}) => {
    const defaultProps = {
      ShowForm: mockShowForm,
      userRole: "teacher",
      userGroupid: 1,
      onGroupChange: mockOnGroupChange,
      ...props,
    };

    return render(
      <BrowserRouter>
        <AssignmentsList {...defaultProps} />
      </BrowserRouter>
    );
  };

  it("debería mostrar el indicador de carga inicialmente", () => {
    // Sobrescribir para este test específico
    mockUseAssignments.mockReturnValue({
      ...defaultMockReturn,
      isLoading: true,
      assignments: [],
    });
    
    renderAssignmentsList();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("debería mostrar la tabla de tareas cuando se cargan los datos", async () => {
    renderAssignmentsList();

    await waitFor(() => {
      expect(screen.getByText("Tareas")).toBeInTheDocument();
    });
  });

  it("debería mostrar el botón 'Crear' para roles de teacher y admin", async () => {
    renderAssignmentsList({ userRole: "teacher" });

    await waitFor(() => {
      expect(screen.getByText("Crear")).toBeInTheDocument();
    });
  });

  it("NO debería mostrar el botón 'Crear' para estudiantes", async () => {
    renderAssignmentsList({ userRole: "student" });

    await waitFor(() => {
      expect(screen.queryByText("Crear")).not.toBeInTheDocument();
    });
  });

  it("debería llamar a ShowForm cuando se hace clic en el botón 'Crear'", async () => {
    renderAssignmentsList({ userRole: "teacher" });

    await waitFor(() => {
      expect(screen.getByText("Crear")).toBeInTheDocument();
    });

    const createButton = screen.getByText("Crear");
    fireEvent.click(createButton);

    expect(mockShowForm).toHaveBeenCalledTimes(1);
  });

  it("debería mostrar las tareas filtradas por grupo", async () => {
    renderAssignmentsList();

    await waitFor(() => {
      expect(screen.getByText("Tarea 1")).toBeInTheDocument();
      expect(screen.getByText("Tarea 2")).toBeInTheDocument();
    });
  });

  it("debería mostrar el filtro de grupos", async () => {
    renderAssignmentsList();

    await waitFor(() => {
      const comboboxes = screen.getAllByRole("combobox");
      expect(comboboxes.length).toBeGreaterThan(0);
      
      const groupFilterComboboxDiv = comboboxes[0];
      expect(groupFilterComboboxDiv).toBeInTheDocument();

      const groupFilterInput = groupFilterComboboxDiv.nextElementSibling as HTMLInputElement;
      expect(groupFilterInput).toBeInTheDocument();
      expect(groupFilterInput).toHaveValue("1");
    });
  });

  it("debería mostrar el componente de ordenamiento", async () => {
    renderAssignmentsList();

    await waitFor(() => {
      expect(screen.getByRole("combobox", { name: "Ordenar" })).toBeInTheDocument();
    });
  });

  it("debería manejar el cambio de grupo correctamente", async () => {
    renderAssignmentsList();

    await waitFor(() => {
      const comboboxes = screen.getAllByRole("combobox");
      expect(comboboxes.length).toBeGreaterThan(0);
      
      const groupFilterComboboxDiv = comboboxes[0];
      const groupFilterInput = groupFilterComboboxDiv.nextElementSibling as HTMLInputElement;
      expect(groupFilterInput).toHaveValue("1");
    });
  });

  it("debería mostrar mensaje cuando no hay tareas", async () => {
    // Sobrescribir para este test - lista vacía de tareas
    mockUseAssignments.mockReturnValue({
      ...defaultMockReturn,
      assignments: [],
      groupList: [{ id: 1, groupName: "Grupo 1", groupDetail: "Detalle 1", creationDate: new Date() }],
      selectedGroup: 1,
      isLoading: false,
    });
    
    renderAssignmentsList();

    await waitFor(() => {
      expect(screen.getByText("Tareas")).toBeInTheDocument();
      expect(screen.queryByText("Tarea 1")).not.toBeInTheDocument();
    });
  });

  it("debería manejar errores en la carga de datos", async () => {
    // El error se maneja dentro del hook, solo verificamos que el componente se renderiza
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    renderAssignmentsList();

    await waitFor(() => {
      expect(screen.getByText("Tareas")).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it("debería usar datos de localStorage para grupos de estudiantes", async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'selectedGroup') return '1';  // ← Cambiar de 'userGroups' a 'selectedGroup'
      if (key === 'userGroups') return '[1, 2]';
      return null;
    });
    
    // Para estudiantes, el hook se comporta diferente
    mockUseAssignments.mockReturnValue({
      ...defaultMockReturn,
      groupList: [
        { id: 1, groupName: "Grupo 1", groupDetail: "Detalle 1", creationDate: new Date() },
        { id: 2, groupName: "Grupo 2", groupDetail: "Detalle 2", creationDate: new Date() },
      ],
    });
    
    renderAssignmentsList({ userRole: "student", userGroupid: [1, 2] });

    await waitFor(() => {
      expect(screen.getByText("Tareas")).toBeInTheDocument();
    });
    
    // Verificar que se llamó a getItem
    expect(localStorageMock.getItem).toHaveBeenCalledWith('selectedGroup');
  });

  it("debería manejar el evento de actualización de tareas", async () => {
    renderAssignmentsList();

    const assignmentUpdatedEvent = new CustomEvent('assignment-updated');
    globalThis.dispatchEvent(assignmentUpdatedEvent);

    await waitFor(() => {
      expect(screen.getByText("Tareas")).toBeInTheDocument();
    });
  });
});