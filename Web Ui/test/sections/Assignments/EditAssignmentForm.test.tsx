import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import EditAssignmentDialog from "../../../src/sections/Assignments/components/EditAssignmentForm";
import { AssignmentDataObject } from "../../../src/modules/Assignments/domain/assignmentInterfaces";
import { GroupDataObject } from "../../../src/modules/Groups/domain/GroupInterface";

// Mock de las dependencias usando las mejores prácticas aprendidas
const mockAssignmentsRepo = {
  getAssignmentById: jest.fn(),
  updateAssignment: jest.fn(),
};

const mockGetGroups = {
  getGroups: jest.fn(),
};

const mockUpdateAssignment = {
  updateAssignment: jest.fn(),
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

jest.mock("../../../src/modules/Assignments/application/UpdateAssignment", () => {
  return {
    __esModule: true,
    UpdateAssignment: jest.fn(() => mockUpdateAssignment),
  };
});

// Mock de window.dispatchEvent
Object.defineProperty(window, 'dispatchEvent', {
  value: jest.fn(),
});

describe("EditAssignmentDialog Component", () => {
  const mockOnClose = jest.fn();

  const mockAssignment: AssignmentDataObject = {
    id: 1,
    title: "Tarea Original",
    description: "Descripción original",
    start_date: new Date("2024-01-01"),
    end_date: new Date("2024-01-15"),
    state: "pending",
    link: "https://github.com/test/repo",
    comment: "Comentario original",
    groupid: 1,
  };

  const mockGroups: GroupDataObject[] = [
    {
      id: 1,
      groupName: "Grupo Original",
      groupDetail: "Descripción del grupo original",
      creationDate: new Date(),
    },
    {
      id: 2,
      groupName: "Grupo Nuevo",
      groupDetail: "Descripción del grupo nuevo",
      creationDate: new Date(),
    },
  ];

  const defaultProps = {
    assignmentId: 1,
    currentGroupName: "Grupo Original",
    currentTitle: "Tarea Original",
    currentDescription: "Descripción original",
    onClose: mockOnClose,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configurar mocks por defecto
    mockAssignmentsRepo.getAssignmentById.mockResolvedValue(mockAssignment);
    mockGetGroups.getGroups.mockResolvedValue(mockGroups);
    mockUpdateAssignment.updateAssignment.mockResolvedValue(undefined);
  });

  const renderEditDialog = (props = {}) => {
    const mergedProps = { ...defaultProps, ...props };
    return render(<EditAssignmentDialog {...mergedProps} />);
  };

  it("debería renderizar el diálogo de edición correctamente", async () => {
    renderEditDialog();

    await waitFor(() => {
        expect(screen.getByText("Editar Tarea : Tarea Original")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Tarea Original")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Descripción original")).toBeInTheDocument();
        expect(screen.getByText("Cancelar")).toBeInTheDocument();
        expect(screen.getByText("Guardar Cambios")).toBeInTheDocument();
      });
    },
    15000
  );

  it("debería mostrar los valores actuales en los campos", async () => {
    renderEditDialog();

    await waitFor(() => {
      const titleField = screen.getByDisplayValue("Tarea Original");
      const descriptionField = screen.getByDisplayValue("Descripción original");
      
      expect(titleField).toBeInTheDocument();
      expect(descriptionField).toBeInTheDocument();
    });
  });

  it("debería cargar la lista de grupos", async () => {
    renderEditDialog();

    await waitFor(() => {
      expect(mockGetGroups.getGroups).toHaveBeenCalledTimes(1);
    });
  });

  it("debería permitir editar el título", async () => {
    renderEditDialog();

    await waitFor(() => {
      const titleField = screen.getByDisplayValue("Tarea Original");
      fireEvent.change(titleField, { target: { value: "Título Editado" } });
      expect(titleField).toHaveValue("Título Editado");
    });
  });

  it("debería permitir editar la descripción", async () => {
    renderEditDialog();

    await waitFor(() => {
      const descriptionField = screen.getByDisplayValue("Descripción original");
      fireEvent.change(descriptionField, { target: { value: "Descripción editada" } });
      expect(descriptionField).toHaveValue("Descripción editada");
    });
  });

  it("debería mostrar el grupo actual en el selector", async () => {
    renderEditDialog();

    await waitFor(() => {
      expect(screen.getByText("Grupo Original")).toBeInTheDocument();
    });
  });

  it("debería cerrar el diálogo cuando se hace clic en Cancelar", async () => {
    renderEditDialog();

    await waitFor(() => {
      const cancelButton = screen.getByText("Cancelar");
      fireEvent.click(cancelButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it("debería guardar los cambios cuando se hace clic en Guardar Cambios", async () => {
    renderEditDialog();

    await waitFor(() => {
      const saveButton = screen.getByText("Guardar Cambios");
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(mockAssignmentsRepo.getAssignmentById).toHaveBeenCalledWith(1);
      expect(mockUpdateAssignment.updateAssignment).toHaveBeenCalledWith(1, expect.any(Object));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(window.dispatchEvent).toHaveBeenCalledWith(expect.any(CustomEvent));
    });
  });

  it("debería mantener valores originales cuando los campos están vacíos", async () => {
    renderEditDialog();

    await waitFor(() => {
      const titleField = screen.getByDisplayValue("Tarea Original");
      const descriptionField = screen.getByDisplayValue("Descripción original");
      
      // Limpiar los campos
      fireEvent.change(titleField, { target: { value: "" } });
      fireEvent.change(descriptionField, { target: { value: "" } });
      
      const saveButton = screen.getByText("Guardar Cambios");
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(mockUpdateAssignment.updateAssignment).toHaveBeenCalledWith(1, {
        title: "Tarea Original", // Valor original mantenido
        description: "Descripción original", // Valor original mantenido
        groupid: 1, // Valor original mantenido
        id: 1,
        start_date: mockAssignment.start_date,
        end_date: mockAssignment.end_date,
        state: mockAssignment.state,
        link: mockAssignment.link,
        comment: mockAssignment.comment,
      });
    });
  });

  it("debería usar valores editados cuando se proporcionan", async () => {
    renderEditDialog();

    await waitFor(() => {
      const titleField = screen.getByDisplayValue("Tarea Original");
      const descriptionField = screen.getByDisplayValue("Descripción original");
      
      fireEvent.change(titleField, { target: { value: "Nuevo Título" } });
      fireEvent.change(descriptionField, { target: { value: "Nueva Descripción" } });
      
      const saveButton = screen.getByText("Guardar Cambios");
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(mockUpdateAssignment.updateAssignment).toHaveBeenCalledWith(1, {
        title: "Nuevo Título",
        description: "Nueva Descripción",
        groupid: 1, // Valor original mantenido
        id: 1,
        start_date: mockAssignment.start_date,
        end_date: mockAssignment.end_date,
        state: mockAssignment.state,
        link: mockAssignment.link,
        comment: mockAssignment.comment,
      });
    });
  });

  it("debería manejar errores al guardar cambios", async () => {
    mockUpdateAssignment.updateAssignment.mockRejectedValue(new Error("Error de red"));
    
    // Mock console.error para evitar logs en los tests
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    renderEditDialog();

    await waitFor(() => {
      const saveButton = screen.getByText("Guardar Cambios");
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Error al guardar los cambios:", expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it("debería mostrar diálogo de error cuando hay un error", async () => {
    (mockUpdateAssignment.updateAssignment as jest.Mock).mockRejectedValue(
    new Error("Limite de caracteres excedido. El titulo no puede tener mas de 50 caracteres.")
  );
    renderEditDialog();

    await waitFor(() => {
      const saveButton = screen.getByText("Guardar Cambios");
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(screen.getByText("Error")).toBeInTheDocument();
    });
    const errorMessage = screen.getByText(/Límite de caracteres|Limite de caracteres/i);
  expect(errorMessage).toBeInTheDocument();
  });

  it("debería cerrar el diálogo de error", async () => {
    mockUpdateAssignment.updateAssignment.mockRejectedValue(new Error("Error de validación"));

    renderEditDialog();

    await waitFor(() => {
      const saveButton = screen.getByText("Guardar Cambios");
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      const closeErrorButton = screen.getByText("Cerrar");
      fireEvent.click(closeErrorButton);
    });

    await waitFor(() => {
      expect(screen.queryByText("Error")).not.toBeInTheDocument();
    });
  });

  it("debería manejar el caso cuando la tarea no existe", async () => {
    mockAssignmentsRepo.getAssignmentById.mockResolvedValue(null);
    
    // Mock console.error para evitar logs en los tests
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    renderEditDialog();

    await waitFor(() => {
      const saveButton = screen.getByText("Guardar Cambios");
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("La tarea actual no se encontró.");
    });

    consoleSpy.mockRestore();
  });

  it("debería obtener la tarea actual al guardar cambios", async () => {
    renderEditDialog();

    await waitFor(() => {
      const saveButton = screen.getByText("Guardar Cambios");
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(mockAssignmentsRepo.getAssignmentById).toHaveBeenCalledWith(1);
    });
  });

  it("debería mantener todos los campos originales en la actualización", async () => {
    renderEditDialog();

    await waitFor(() => {
      const saveButton = screen.getByText("Guardar Cambios");
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      const updateCall = mockUpdateAssignment.updateAssignment.mock.calls[0];
      const updatedData = updateCall[1];
      
      expect(updatedData.id).toBe(1);
      expect(updatedData.start_date).toBe(mockAssignment.start_date);
      expect(updatedData.end_date).toBe(mockAssignment.end_date);
      expect(updatedData.state).toBe(mockAssignment.state);
      expect(updatedData.link).toBe(mockAssignment.link);
      expect(updatedData.comment).toBe(mockAssignment.comment);
    });
  });
});