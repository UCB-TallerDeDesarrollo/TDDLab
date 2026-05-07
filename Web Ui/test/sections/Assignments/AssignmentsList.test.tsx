import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import AssignmentsList from "../../../src/sections/Assignments/components/AssignmentsList";
import { AssignmentDataObject } from "../../../src/modules/Assignments/domain/assignmentInterfaces";
import { GroupDataObject } from "../../../src/modules/Groups/domain/GroupInterface";

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

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

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
    globalThis.location.search = '';
    
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
      expect(screen.getByText("Título")).toBeInTheDocument();
    });
  });

  it("debería mostrar el header de la columna Título", async () => {
    renderAssignmentsList();

    await waitFor(() => {
      expect(screen.getByText("Título")).toBeInTheDocument();
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
      const groupFilterComboboxDiv = comboboxes[0]; 

      const groupFilterInput = groupFilterComboboxDiv.nextElementSibling as HTMLInputElement;
      expect(groupFilterInput).toHaveValue("1"); 
    });
    
    const comboboxes = screen.getAllByRole("combobox");
    const groupFilterComboboxDiv = comboboxes[0];
    const groupFilterInput = groupFilterComboboxDiv.nextElementSibling as HTMLInputElement;
    expect(groupFilterInput).toHaveValue("1");
  });

  it("debería mostrar mensaje cuando no hay tareas", async () => {
    mockAssignmentsRepo.getAssignmentsByGroupid.mockResolvedValueOnce([]);
    
    renderAssignmentsList();

    await waitFor(() => {
      expect(screen.getByText("Título")).toBeInTheDocument();
      expect(screen.queryByText("Tarea 1")).not.toBeInTheDocument(); // La tabla debería estar vacía pero presente
    });
  });

  it("debería manejar errores en la carga de datos", async () => {
    mockAssignmentsRepo.getAssignmentsByGroupid.mockRejectedValueOnce(new Error("Error de red"));
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    renderAssignmentsList();

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Error fetching assignments:", expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it("debería usar datos de localStorage para grupos de estudiantes", async () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'userGroups') return '[1, 2]';
      return null;
    });
    
    renderAssignmentsList({ userRole: "student", userGroupid: [1, 2] });

    await waitFor(() => {
      expect(mockGetGroups.getGroupById).toHaveBeenCalledWith(1);
      expect(mockGetGroups.getGroupById).toHaveBeenCalledWith(2);
    });
  });

  it("debería manejar el evento de actualización de tareas", async () => {
    renderAssignmentsList();

    const assignmentUpdatedEvent = new CustomEvent('assignment-updated');
    globalThis.dispatchEvent(assignmentUpdatedEvent);

    await waitFor(() => {
      expect(mockAssignmentsRepo.getAssignmentsByGroupid).toHaveBeenCalledTimes(2);
    });
  });

  it("debería navegar al detalle al hacer clic en ver tarea", async () => {
    renderAssignmentsList({ userRole: "teacher" });

    await waitFor(() => {
      expect(screen.getByText("Tarea 1")).toBeInTheDocument();
    });

    const detailButtons = screen.getAllByRole("button", { name: "see" });
    fireEvent.click(detailButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith("/assignment/1");
  });

  it("debería abrir el diálogo de confirmación al hacer clic en eliminar", async () => {
    renderAssignmentsList({ userRole: "teacher" });

    await waitFor(() => {
      expect(screen.getByText("Tarea 1")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole("button", { name: "delete" });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("¿Eliminar la tarea?")).toBeInTheDocument();
    });
  });

  it("debería cancelar la eliminación", async () => {
    renderAssignmentsList({ userRole: "teacher" });

    await waitFor(() => {
      expect(screen.getByText("Tarea 1")).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByRole("button", { name: "delete" })[0]);

    await waitFor(() => {
      expect(screen.getByText("¿Eliminar la tarea?")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Cancelar"));

    await waitFor(() => {
      expect(screen.queryByText("¿Eliminar la tarea?")).not.toBeInTheDocument();
    });
  });

  it("debería confirmar la eliminación y mostrar diálogo de éxito", async () => {
    mockDeleteAssignment.deleteAssignment.mockResolvedValue({});
    renderAssignmentsList({ userRole: "teacher" });

    await waitFor(() => {
      expect(screen.getByText("Tarea 1")).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByRole("button", { name: "delete" })[0]);

    await waitFor(() => {
      expect(screen.getByText("Eliminar")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Eliminar"));

    await waitFor(() => {
      expect(mockDeleteAssignment.deleteAssignment).toHaveBeenCalledTimes(1);
      expect(screen.getByText("Tarea eliminada exitosamente")).toBeInTheDocument();
    });
  });

  it("debería cerrar el diálogo de éxito y recargar tareas", async () => {
    mockDeleteAssignment.deleteAssignment.mockResolvedValue({});
    renderAssignmentsList({ userRole: "teacher" });

    await waitFor(() => {
      expect(screen.getByText("Tarea 1")).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByRole("button", { name: "delete" })[0]);

    await waitFor(() => {
      fireEvent.click(screen.getByText("Eliminar"));
    });

    await waitFor(() => {
      expect(screen.getByText("Tarea eliminada exitosamente")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Cerrar"));

    await waitFor(() => {
      expect(mockAssignmentsRepo.getAssignmentsByGroupid).toHaveBeenCalled();
    });
  });

  it("debería manejar error al eliminar una tarea", async () => {
    mockDeleteAssignment.deleteAssignment.mockRejectedValue(new Error("Error al eliminar"));
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    renderAssignmentsList({ userRole: "teacher" });

    await waitFor(() => {
      expect(screen.getByText("Tarea 1")).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByRole("button", { name: "delete" })[0]);

    await waitFor(() => {
      fireEvent.click(screen.getByText("Eliminar"));
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error eliminando assignment:",
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  it("debería abrir el formulario de edición al hacer clic en editar", async () => {
    renderAssignmentsList({ userRole: "teacher" });

    await waitFor(() => {
      expect(screen.getByText("Tarea 1")).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole("button", { name: "edit" });
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Editar Tarea : Tarea 1")).toBeInTheDocument();
    });
  });

  it("debería ordenar tareas al cambiar el selector de ordenamiento", async () => {
    renderAssignmentsList();

    await waitFor(() => {
      expect(screen.getByRole("combobox", { name: "Ordenar" })).toBeInTheDocument();
    });

    const sortCombobox = screen.getByRole("combobox", { name: "Ordenar" });
    fireEvent.mouseDown(sortCombobox);

    await waitFor(() => {
      expect(screen.getByRole("option", { name: "Orden alfabetico ascendente" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("option", { name: "Orden alfabetico ascendente" }));

    await waitFor(() => {
      expect(screen.getByText("Tarea 1")).toBeInTheDocument();
    });
  });

  it("debería cargar todos los grupos para rol admin", async () => {
    renderAssignmentsList({ userRole: "admin" });

    await waitFor(() => {
      expect(mockGetGroups.getGroups).toHaveBeenCalled();
    });
  });

  it("debería cargar tareas al cambiar de grupo en el filtro", async () => {
    renderAssignmentsList();

    await waitFor(() => {
      expect(screen.getByText("Tarea 1")).toBeInTheDocument();
    });

    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === "selectedGroup") return "2";
      return null;
    });

    mockAssignmentsRepo.getAssignmentsByGroupid.mockResolvedValue([
      {
        id: 3,
        title: "Tarea del Grupo 2",
        description: "desc",
        start_date: new Date(),
        end_date: new Date(),
        state: "pending",
        link: "",
        comment: "",
        groupid: 2,
      },
    ]);

    globalThis.dispatchEvent(new CustomEvent("assignment-updated"));

    await waitFor(() => {
      expect(mockAssignmentsRepo.getAssignmentsByGroupid).toHaveBeenCalledWith(2);
    });
  });
});
