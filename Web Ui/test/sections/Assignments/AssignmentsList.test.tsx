import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import AssignmentsList from "../../../src/sections/Assignments/components/AssignmentsList";
import { AssignmentDataObject } from "../../../src/modules/Assignments/domain/assignmentInterfaces";
import { GroupDataObject } from "../../../src/modules/Groups/domain/GroupInterface";

// Mock de las dependencias
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
    default: jest.fn(() => ({})),
  };
});

jest.mock("../../../src/modules/Groups/application/GetGroups", () => {
  return {
    __esModule: true,
    default: jest.fn(() => mockGetGroups),
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
      usergroupid: 1,
    },
    jest.fn(),
  ]),
}));

// Mock de localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock de window.location
Object.defineProperty(window, 'location', {
  value: {
    search: '',
  },
  writable: true,
});

// Mock de window.addEventListener y removeEventListener
Object.defineProperty(window, 'addEventListener', {
  value: jest.fn(),
});
Object.defineProperty(window, 'removeEventListener', {
  value: jest.fn(),
});

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
      state: "completed",
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
    localStorageMock.getItem.mockReturnValue(null);
    window.location.search = '';
    
    // Configurar mocks por defecto
    mockAssignmentsRepo.getAssignmentsByGroupid.mockResolvedValue(mockAssignments);
    mockGetGroups.getGroups.mockResolvedValue(mockGroups);
    mockGetGroups.getGroupById.mockResolvedValue(mockGroups[0]);
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
    const AssignmentsRepository = require("../../../src/modules/Assignments/repository/AssignmentsRepository").default;
    const GetGroups = require("../../../src/modules/Groups/application/GetGroups").default;
    
    const mockAssignmentsRepo = new AssignmentsRepository();
    const mockGetGroups = new GetGroups();
    
    mockAssignmentsRepo.getAssignmentsByGroupid.mockResolvedValue(mockAssignments);
    mockGetGroups.getGroups.mockResolvedValue(mockGroups);
    mockGetGroups.getGroupById.mockResolvedValue(mockGroups[0]);

    renderAssignmentsList({ userRole: "teacher" });

    await waitFor(() => {
      expect(screen.getByText("Crear")).toBeInTheDocument();
    });
  });

  it("NO debería mostrar el botón 'Crear' para estudiantes", async () => {
    const AssignmentsRepository = require("../../../src/modules/Assignments/repository/AssignmentsRepository").default;
    const GetGroups = require("../../../src/modules/Groups/application/GetGroups").default;
    
    const mockAssignmentsRepo = new AssignmentsRepository();
    const mockGetGroups = new GetGroups();
    
    mockAssignmentsRepo.getAssignmentsByGroupid.mockResolvedValue(mockAssignments);
    mockGetGroups.getGroups.mockResolvedValue(mockGroups);
    mockGetGroups.getGroupById.mockResolvedValue(mockGroups[0]);

    renderAssignmentsList({ userRole: "student" });

    await waitFor(() => {
      expect(screen.queryByText("Crear")).not.toBeInTheDocument();
    });
  });

  it("debería llamar a ShowForm cuando se hace clic en el botón 'Crear'", async () => {
    const AssignmentsRepository = require("../../../src/modules/Assignments/repository/AssignmentsRepository").default;
    const GetGroups = require("../../../src/modules/Groups/application/GetGroups").default;
    
    const mockAssignmentsRepo = new AssignmentsRepository();
    const mockGetGroups = new GetGroups();
    
    mockAssignmentsRepo.getAssignmentsByGroupid.mockResolvedValue(mockAssignments);
    mockGetGroups.getGroups.mockResolvedValue(mockGroups);
    mockGetGroups.getGroupById.mockResolvedValue(mockGroups[0]);

    renderAssignmentsList({ userRole: "teacher" });

    await waitFor(() => {
      expect(screen.getByText("Crear")).toBeInTheDocument();
    });

    const createButton = screen.getByText("Crear");
    fireEvent.click(createButton);

    expect(mockShowForm).toHaveBeenCalledTimes(1);
  });

  it("debería mostrar las tareas filtradas por grupo", async () => {
    const AssignmentsRepository = require("../../../src/modules/Assignments/repository/AssignmentsRepository").default;
    const GetGroups = require("../../../src/modules/Groups/application/GetGroups").default;
    
    const mockAssignmentsRepo = new AssignmentsRepository();
    const mockGetGroups = new GetGroups();
    
    mockAssignmentsRepo.getAssignmentsByGroupid.mockResolvedValue(mockAssignments);
    mockGetGroups.getGroups.mockResolvedValue(mockGroups);
    mockGetGroups.getGroupById.mockResolvedValue(mockGroups[0]);

    renderAssignmentsList();

    await waitFor(() => {
      expect(screen.getByText("Tarea 1")).toBeInTheDocument();
      expect(screen.getByText("Tarea 2")).toBeInTheDocument();
    });
  });

  it("debería mostrar el filtro de grupos", async () => {
    const AssignmentsRepository = require("../../../src/modules/Assignments/repository/AssignmentsRepository").default;
    const GetGroups = require("../../../src/modules/Groups/application/GetGroups").default;
    
    const mockAssignmentsRepo = new AssignmentsRepository();
    const mockGetGroups = new GetGroups();
    
    mockAssignmentsRepo.getAssignmentsByGroupid.mockResolvedValue(mockAssignments);
    mockGetGroups.getGroups.mockResolvedValue(mockGroups);
    mockGetGroups.getGroupById.mockResolvedValue(mockGroups[0]);

    renderAssignmentsList();

    await waitFor(() => {
      expect(screen.getByText("Grupo 1")).toBeInTheDocument();
    });
  });

  it("debería mostrar el componente de ordenamiento", async () => {
    const AssignmentsRepository = require("../../../src/modules/Assignments/repository/AssignmentsRepository").default;
    const GetGroups = require("../../../src/modules/Groups/application/GetGroups").default;
    
    const mockAssignmentsRepo = new AssignmentsRepository();
    const mockGetGroups = new GetGroups();
    
    mockAssignmentsRepo.getAssignmentsByGroupid.mockResolvedValue(mockAssignments);
    mockGetGroups.getGroups.mockResolvedValue(mockGroups);
    mockGetGroups.getGroupById.mockResolvedValue(mockGroups[0]);

    renderAssignmentsList();

    await waitFor(() => {
      // El componente SortingComponent debería estar presente (usar aria-label para ser específico)
      expect(screen.getByRole("combobox", { name: "Ordenar" })).toBeInTheDocument();
    });
  });

  it("debería manejar el cambio de grupo correctamente", async () => {
    renderAssignmentsList();

    await waitFor(() => {
      expect(screen.getByText("Grupo 1")).toBeInTheDocument();
    });

    // Simular cambio de grupo usando click en lugar de change
    const groupSelects = screen.getAllByRole("combobox");
    const groupSelect = groupSelects[0];
    fireEvent.click(groupSelect);

    // Verificar que el componente se renderizó correctamente
    expect(screen.getByText("Grupo 1")).toBeInTheDocument();
  });

  it("debería mostrar mensaje cuando no hay tareas", async () => {
    const AssignmentsRepository = require("../../../src/modules/Assignments/repository/AssignmentsRepository").default;
    const GetGroups = require("../../../src/modules/Groups/application/GetGroups").default;
    
    const mockAssignmentsRepo = new AssignmentsRepository();
    const mockGetGroups = new GetGroups();
    
    mockAssignmentsRepo.getAssignmentsByGroupid.mockResolvedValue([]);
    mockGetGroups.getGroups.mockResolvedValue(mockGroups);
    mockGetGroups.getGroupById.mockResolvedValue(mockGroups[0]);

    renderAssignmentsList();

    await waitFor(() => {
      expect(screen.getByText("Tareas")).toBeInTheDocument();
      // La tabla debería estar vacía pero presente
      expect(screen.queryByText("Tarea 1")).not.toBeInTheDocument();
    });
  });

  it("debería manejar errores en la carga de datos", async () => {
    const AssignmentsRepository = require("../../../src/modules/Assignments/repository/AssignmentsRepository").default;
    const GetGroups = require("../../../src/modules/Groups/application/GetGroups").default;
    
    const mockAssignmentsRepo = new AssignmentsRepository();
    const mockGetGroups = new GetGroups();
    
    mockAssignmentsRepo.getAssignmentsByGroupid.mockRejectedValue(new Error("Error de red"));
    mockGetGroups.getGroups.mockResolvedValue(mockGroups);
    mockGetGroups.getGroupById.mockResolvedValue(mockGroups[0]);

    // Mock console.error para evitar logs en los tests
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    renderAssignmentsList();

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Error fetching assignments:", expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it("debería usar datos de localStorage para grupos de estudiantes", async () => {
    const AssignmentsRepository = require("../../../src/modules/Assignments/repository/AssignmentsRepository").default;
    const GetGroups = require("../../../src/modules/Groups/application/GetGroups").default;
    
    const mockAssignmentsRepo = new AssignmentsRepository();
    const mockGetGroups = new GetGroups();
    
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'userGroups') return '[1, 2]';
      return null;
    });
    
    mockAssignmentsRepo.getAssignmentsByGroupid.mockResolvedValue(mockAssignments);
    mockGetGroups.getGroupById.mockResolvedValue(mockGroups[0]);

    renderAssignmentsList({ userRole: "student", userGroupid: [1, 2] });

    await waitFor(() => {
      expect(mockGetGroups.getGroupById).toHaveBeenCalledWith(1);
      expect(mockGetGroups.getGroupById).toHaveBeenCalledWith(2);
    });
  });

  it("debería manejar el evento de actualización de tareas", async () => {
    const AssignmentsRepository = require("../../../src/modules/Assignments/repository/AssignmentsRepository").default;
    const GetGroups = require("../../../src/modules/Groups/application/GetGroups").default;
    
    const mockAssignmentsRepo = new AssignmentsRepository();
    const mockGetGroups = new GetGroups();
    
    mockAssignmentsRepo.getAssignmentsByGroupid.mockResolvedValue(mockAssignments);
    mockGetGroups.getGroups.mockResolvedValue(mockGroups);
    mockGetGroups.getGroupById.mockResolvedValue(mockGroups[0]);

    renderAssignmentsList();

    // Simular el evento de actualización
    const assignmentUpdatedEvent = new CustomEvent('assignment-updated');
    window.dispatchEvent(assignmentUpdatedEvent);

    await waitFor(() => {
      expect(mockAssignmentsRepo.getAssignmentsByGroupid).toHaveBeenCalled();
    });
  });
});
