import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import AssignmentsForm from "../../../src/sections/Assignments/components/AssignmentForm";

const mockAssignmentsRepo = {
  getAssignmentsByGroupid: jest.fn(),
  createAssignment: jest.fn(),
};

const mockCreateAssignment = {
  createAssignment: jest.fn(),
};

const mockGetGroups = {
  getGroups: jest.fn(),
  getGroupById: jest.fn(),
  getGroupsByUserId: jest.fn(),
};

jest.mock("../../../src/modules/Assignments/repository/AssignmentsRepository", () => ({
  __esModule: true,
  default: jest.fn(() => mockAssignmentsRepo),
}));

jest.mock("../../../src/modules/Assignments/application/CreateAssingment", () => ({
  __esModule: true,
  CreateAssignments: jest.fn(() => mockCreateAssignment),
}));

jest.mock("../../../src/modules/Groups/repository/GroupsRepository", () => ({
  __esModule: true,
  default: jest.fn(() => ({})),
}));

jest.mock("../../../src/modules/Groups/application/GetGroups", () => ({
  __esModule: true,
  default: jest.fn(() => mockGetGroups),
}));

// Mock DatePicker (Filter)
jest.mock("../../../src/sections/Assignments/components/DatePicker", () => ({
  __esModule: true,
  default: ({ onUpdateDates }: { onUpdateDates: (s: Date, e: Date) => void }) => (
    <div data-testid="date-picker">
      <button
        onClick={() => onUpdateDates(new Date("2024-01-01"), new Date("2024-01-15"))}
      >
        Cambiar fechas
      </button>
      <button
        onClick={() => onUpdateDates(new Date("2024-01-15"), new Date("2024-01-01"))}
      >
        Cambiar fechas invertidas
      </button>
    </div>
  ),
}));

// Mock authStates
const mockUseGlobalState = jest.fn();
jest.mock("../../../src/modules/User-Authentication/domain/authStates", () => ({
  useGlobalState: () => mockUseGlobalState(),
}));

// localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

// location.reload
Object.defineProperty(globalThis, "location", {
  value: { reload: jest.fn(), search: "" },
  writable: true,
});

// Datos de prueba
const mockGroups = [
  { id: 1, groupName: "Grupo 1", groupDetail: "Detalle 1", creationDate: new Date() },
  { id: 2, groupName: "Grupo 2", groupDetail: "Detalle 2", creationDate: new Date() },
];

// Helper de render
const renderForm = (props = {}) => {
  const defaultProps = {
    open: true,
    handleClose: jest.fn(),
    groupid: 1,
    ...props,
  };
  return render(
    <BrowserRouter>
      <AssignmentsForm {...defaultProps} />
    </BrowserRouter>
  );
};

// Tests 
  describe("AssignmentsForm Component", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      localStorageMock.getItem.mockReturnValue(null);
      mockAssignmentsRepo.getAssignmentsByGroupid.mockResolvedValue([]);
      mockCreateAssignment.createAssignment.mockResolvedValue({});
  });

  //  Render
  describe("Render inicial", () => {
    it("debería mostrar el dialog cuando open=true", async () => {
      mockUseGlobalState.mockReturnValue([{ userid: 1, userRole: "teacher" }, jest.fn()]);
      mockGetGroups.getGroupsByUserId.mockResolvedValue([1]);
      mockGetGroups.getGroupById.mockResolvedValue(mockGroups[0]);

      renderForm();

      await waitFor(() => {
        expect(screen.getByText("Crear tarea")).toBeInTheDocument();
      });
    });

    it("NO debería mostrar el dialog cuando open=false", () => {
      mockUseGlobalState.mockReturnValue([{ userid: 1, userRole: "teacher" }, jest.fn()]);

      renderForm({ open: false });

      expect(screen.queryByText("Crear tarea")).not.toBeInTheDocument();
    });

    it("debería mostrar los campos del formulario", async () => {
      mockUseGlobalState.mockReturnValue([{ userid: 1, userRole: "teacher" }, jest.fn()]);
      mockGetGroups.getGroupsByUserId.mockResolvedValue([1]);
      mockGetGroups.getGroupById.mockResolvedValue(mockGroups[0]);

      renderForm();

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre de la tarea/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
        expect(screen.getByTestId("date-picker")).toBeInTheDocument();
      });
    });
  });

  // Carga de grupos por rol
  describe("Carga de grupos según rol", () => {
    it("teacher: debería cargar grupos por userId", async () => {
      mockUseGlobalState.mockReturnValue([{ userid: 10, userRole: "teacher" }, jest.fn()]);
      mockGetGroups.getGroupsByUserId.mockResolvedValue([1, 2]);
      mockGetGroups.getGroupById.mockImplementation((id: number) =>
      Promise.resolve(mockGroups.find((g) => g.id === id))
    );

      renderForm();

      await waitFor(() => {
        expect(mockGetGroups.getGroupsByUserId).toHaveBeenCalledWith(10);
        expect(mockGetGroups.getGroupById).toHaveBeenCalledWith(1);
        expect(mockGetGroups.getGroupById).toHaveBeenCalledWith(2);
      });

      const select = document.getElementById("group-select")!;
      fireEvent.mouseDown(select);

      await waitFor(() => {
        expect(screen.getByRole("option", { name: "Grupo 1" })).toBeInTheDocument();
        expect(screen.getByRole("option", { name: "Grupo 2" })).toBeInTheDocument();
      });
    });

    it("admin: debería cargar todos los grupos", async () => {
      mockUseGlobalState.mockReturnValue([{ userid: 1, userRole: "admin" }, jest.fn()]);
      mockGetGroups.getGroups.mockResolvedValue(mockGroups);

      renderForm();

      await waitFor(() => {
        expect(mockGetGroups.getGroups).toHaveBeenCalled();
      });

      const select = document.getElementById("group-select")!;
      fireEvent.mouseDown(select);

      await waitFor(() => {
        expect(screen.getByRole("option", { name: "Grupo 1" })).toBeInTheDocument();
        expect(screen.getByRole("option", { name: "Grupo 2" })).toBeInTheDocument();
      });
    });

    it("student: debería cargar grupos desde localStorage si existen", async () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === "userGroups") return "[1, 2]";
        return null;
      });
      mockUseGlobalState.mockReturnValue([{ userid: 5, userRole: "student" }, jest.fn()]);
      mockGetGroups.getGroupById.mockImplementation((id: number) =>
        Promise.resolve(mockGroups.find((g) => g.id === id))
      );

      renderForm();

      await waitFor(() => {
        expect(mockGetGroups.getGroupById).toHaveBeenCalledWith(1);
        expect(mockGetGroups.getGroupById).toHaveBeenCalledWith(2);
        expect(mockGetGroups.getGroupsByUserId).not.toHaveBeenCalled();
      });
    });

    it("student: debería cargar grupos por userId si localStorage está vacío", async () => {
      localStorageMock.getItem.mockReturnValue(null);
      mockUseGlobalState.mockReturnValue([{ userid: 5, userRole: "student" }, jest.fn()]);
      mockGetGroups.getGroupsByUserId.mockResolvedValue([1]);
      mockGetGroups.getGroupById.mockResolvedValue(mockGroups[0]);

      renderForm();

      await waitFor(() => {
        expect(mockGetGroups.getGroupsByUserId).toHaveBeenCalledWith(5);
        expect(mockGetGroups.getGroupById).toHaveBeenCalledWith(1);
      });
    });
    
    it("debería hacer fallback al primer grupo si el groupid prop no existe en la lista", async () => {
      mockUseGlobalState.mockReturnValue([{ userid: 1, userRole: "admin" }, jest.fn()]);
      const otherGroups = [
        { id: 2, groupName: "Grupo 2", groupDetail: "", creationDate: new Date() },
        { id: 3, groupName: "Grupo 3", groupDetail: "", creationDate: new Date() },
      ];
      mockGetGroups.getGroups.mockResolvedValue(otherGroups);

      renderForm({ groupid: 1 });

      await waitFor(() => {
        const nativeInput = document.querySelector(
          ".MuiSelect-nativeInput"
        ) as HTMLInputElement;
        expect(nativeInput.value).toBe("2");
      });
    });

    it("student: debería manejar localStorage con JSON inválido", async () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === "userGroups") return "invalid-json{{{";
        return null;
      });
      mockUseGlobalState.mockReturnValue([{ userid: 5, userRole: "student" }, jest.fn()]);
      mockGetGroups.getGroupsByUserId.mockResolvedValue([1]);
      mockGetGroups.getGroupById.mockResolvedValue(mockGroups[0]);

      renderForm();

      await waitFor(() => {
        expect(mockGetGroups.getGroupsByUserId).toHaveBeenCalledWith(5);
      });
    });

    it("debería usar selectedGroup de localStorage si groupid es 0", async () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === "selectedGroup") return "2";
        return null;
      });
      mockUseGlobalState.mockReturnValue([{ userid: 1, userRole: "teacher" }, jest.fn()]);
      mockGetGroups.getGroupsByUserId.mockResolvedValue([2]);
      mockGetGroups.getGroupById.mockResolvedValue(mockGroups[1]);

      renderForm({ groupid: 0 }); 

      await waitFor(() => {
        const nativeInput = document.querySelector(
          ".MuiSelect-nativeInput"
        ) as HTMLInputElement;
        expect(nativeInput.value).toBe("0");
      });
    });

    it("student: debería ir a getGroupsByUserId si localStorage tiene array vacío", async () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === "userGroups") return "[]"; 
        return null;
      });
      mockUseGlobalState.mockReturnValue([{ userid: 5, userRole: "student" }, jest.fn()]);
      mockGetGroups.getGroupsByUserId.mockResolvedValue([1]);
      mockGetGroups.getGroupById.mockResolvedValue(mockGroups[0]);

      renderForm();

      await waitFor(() => {
        expect(mockGetGroups.getGroupsByUserId).toHaveBeenCalledWith(5);
      });
    });

    it("student: debería filtrar grupos inválidos retornados por getGroupById", async () => {
      localStorageMock.getItem.mockReturnValue(null);
      mockUseGlobalState.mockReturnValue([{ userid: 5, userRole: "student" }, jest.fn()]);
      mockGetGroups.getGroupsByUserId.mockResolvedValue([1, 99]);
      mockGetGroups.getGroupById.mockImplementation((id: number) => {
        if (id === 99) return Promise.resolve(undefined); 
        return Promise.resolve(mockGroups.find((g) => g.id === id));
      });

      renderForm();

      await waitFor(() => {
        const nativeInput = document.querySelector(
          ".MuiSelect-nativeInput"
        ) as HTMLInputElement;
        expect(nativeInput.value).toBe("1");
      });
    });
  });
    
  // Validaciones
  describe("Validaciones del formulario", () => {
    beforeEach(() => {
      mockUseGlobalState.mockReturnValue([{ userid: 1, userRole: "teacher" }, jest.fn()]);
      mockGetGroups.getGroupsByUserId.mockResolvedValue([1]);
      mockGetGroups.getGroupById.mockResolvedValue(mockGroups[0]);
    });

    it("botón Crear debería estar deshabilitado si el título está vacío", async () => {
      renderForm();

      await waitFor(() => {
        expect(screen.getByText("Crear tarea")).toBeInTheDocument();
      });

      const createButton = screen.getByRole("button", { name: /crear/i });
      expect(createButton).toBeDisabled();
    });

    it("botón Crear debería habilitarse al ingresar un título", async () => {
      renderForm();

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre de la tarea/i)).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/nombre de la tarea/i), {
        target: { value: "Mi tarea" },
      });

      expect(screen.getByRole("button", { name: /crear/i })).not.toBeDisabled();
    });

    // Fecha inicio > fin
    it("debería mostrar error si la fecha de inicio es posterior a la fecha de fin", async () => {
      mockUseGlobalState.mockReturnValue([{ userid: 1, userRole: "teacher" }, jest.fn()]);
      mockGetGroups.getGroupsByUserId.mockResolvedValue([1]);
      mockGetGroups.getGroupById.mockResolvedValue(mockGroups[0]);

      renderForm();

      await waitFor(() =>
        expect(screen.getByLabelText(/nombre de la tarea/i)).toBeInTheDocument()
      );

      fireEvent.change(screen.getByLabelText(/nombre de la tarea/i), {
        target: { value: "Tarea con fechas inválidas" },
      });

      fireEvent.click(screen.getByText("Cambiar fechas invertidas"));

      fireEvent.click(screen.getByRole("button", { name: /crear/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/fecha de inicio no puede ser posterior/i)
        ).toBeInTheDocument();
      });
    });

    it("debería mostrar error si ya existe una tarea con el mismo nombre", async () => {
      mockAssignmentsRepo.getAssignmentsByGroupid.mockResolvedValue([
        { id: 99, title: "Tarea duplicada", groupid: 1 },
      ]);

      renderForm();

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre de la tarea/i)).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/nombre de la tarea/i), {
        target: { value: "Tarea duplicada" },
      });

      fireEvent.click(screen.getByRole("button", { name: /crear/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/ya existe una tarea con el mismo nombre/i)
        ).toBeInTheDocument();
      });
    });
  });

  // Creación exitosa
  describe("Creación exitosa", () => {
    beforeEach(() => {
      mockUseGlobalState.mockReturnValue([{ userid: 1, userRole: "teacher" }, jest.fn()]);
      mockGetGroups.getGroupsByUserId.mockResolvedValue([1]);
      mockGetGroups.getGroupById.mockResolvedValue(mockGroups[0]);
      mockAssignmentsRepo.getAssignmentsByGroupid.mockResolvedValue([]);
      mockCreateAssignment.createAssignment.mockResolvedValue({});
    });

    it("debería mostrar mensaje de éxito al crear la tarea correctamente", async () => {
      renderForm();

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre de la tarea/i)).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/nombre de la tarea/i), {
        target: { value: "Nueva tarea" },
      });

      fireEvent.click(screen.getByRole("button", { name: /crear/i }));

      await waitFor(() => {
        expect(screen.getByText("Tarea creada exitosamente")).toBeInTheDocument();
      });
    });

    it("debería llamar a createAssignment con los datos correctos", async () => {
      renderForm({ groupid: 1 });

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre de la tarea/i)).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/nombre de la tarea/i), {
        target: { value: "Tarea de prueba" },
      });
      fireEvent.change(screen.getByLabelText(/descripción/i), {
        target: { value: "Descripción de prueba" },
      });

      fireEvent.click(screen.getByRole("button", { name: /crear/i }));

      await waitFor(() => {
        expect(mockCreateAssignment.createAssignment).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Tarea de prueba",
            description: "Descripción de prueba",
            groupid: 1,
            state: "pending",
          })
        );
      });
    });
    it("debería llamar a location.reload al cerrar el dialog de éxito", async () => {
      mockUseGlobalState.mockReturnValue([{ userid: 1, userRole: "teacher" }, jest.fn()]);
      mockGetGroups.getGroupsByUserId.mockResolvedValue([1]);
      mockGetGroups.getGroupById.mockResolvedValue(mockGroups[0]);
      mockAssignmentsRepo.getAssignmentsByGroupid.mockResolvedValue([]);
      mockCreateAssignment.createAssignment.mockResolvedValue({});

      renderForm();

      await waitFor(() => expect(screen.getByLabelText(/nombre de la tarea/i)).toBeInTheDocument());

      fireEvent.change(screen.getByLabelText(/nombre de la tarea/i), {
        target: { value: "Tarea exitosa" },
      });
      fireEvent.click(screen.getByRole("button", { name: /crear/i }));

      await waitFor(() => {
        expect(screen.getByText("Tarea creada exitosamente")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Cerrar"));

      expect(globalThis.location.reload).toHaveBeenCalledTimes(1);
    });
  });

  // Errores del servidor
  describe("Manejo de errores del servidor", () => {
    beforeEach(() => {
      mockUseGlobalState.mockReturnValue([{ userid: 1, userRole: "teacher" }, jest.fn()]);
      mockGetGroups.getGroupsByUserId.mockResolvedValue([1]);
      mockGetGroups.getGroupById.mockResolvedValue(mockGroups[0]);
      mockAssignmentsRepo.getAssignmentsByGroupid.mockResolvedValue([]);
    });

    it("debería mostrar error de límite de caracteres", async () => {
      mockCreateAssignment.createAssignment.mockRejectedValue(
        new Error("Limite de caracteres excedido")
      );

      renderForm();

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre de la tarea/i)).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/nombre de la tarea/i), {
        target: { value: "Tarea con título muy largo" },
      });

      fireEvent.click(screen.getByRole("button", { name: /crear/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/el título no puede tener más de 50 caracteres/i)
        ).toBeInTheDocument();
      });
    });

    it("debería mostrar error genérico ante fallo desconocido", async () => {
      mockCreateAssignment.createAssignment.mockRejectedValue(
        new Error("Fallo inesperado")
      );

      renderForm();

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre de la tarea/i)).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/nombre de la tarea/i), {
        target: { value: "Tarea fallida" },
      });

      fireEvent.click(screen.getByRole("button", { name: /crear/i }));

      await waitFor(() => {
        expect(screen.getByText(/fallo inesperado/i)).toBeInTheDocument();
      });
    });

    it("debería mostrar error desconocido si el catch recibe un valor no-Error", async () => {
      mockUseGlobalState.mockReturnValue([{ userid: 1, userRole: "teacher" }, jest.fn()]);
      mockGetGroups.getGroupsByUserId.mockResolvedValue([1]);
      mockGetGroups.getGroupById.mockResolvedValue(mockGroups[0]);
      mockAssignmentsRepo.getAssignmentsByGroupid.mockResolvedValue([]);
      mockCreateAssignment.createAssignment.mockRejectedValue("error string puro");

      renderForm();

      await waitFor(() =>
        expect(screen.getByLabelText(/nombre de la tarea/i)).toBeInTheDocument()
      );

      fireEvent.change(screen.getByLabelText(/nombre de la tarea/i), {
        target: { value: "Tarea rara" },
      });

      fireEvent.click(screen.getByRole("button", { name: /crear/i }));

      await waitFor(() => {
        expect(
          screen.getByText("Error desconocido al crear la tarea.")
        ).toBeInTheDocument();
      });
    });

    it("debería llamar a window.location.reload al cerrar el dialog de éxito", async () => {
      const reloadMock = jest.fn();
      Object.defineProperty(window, "location", {
        value: { ...window.location, reload: reloadMock },
        writable: true,
      });

      mockUseGlobalState.mockReturnValue([{ userid: 1, userRole: "teacher" }, jest.fn()]);
      mockGetGroups.getGroupsByUserId.mockResolvedValue([1]);
      mockGetGroups.getGroupById.mockResolvedValue(mockGroups[0]);
      mockAssignmentsRepo.getAssignmentsByGroupid.mockResolvedValue([]);
      mockCreateAssignment.createAssignment.mockResolvedValue({});

      renderForm();

      await waitFor(() =>
        expect(screen.getByLabelText(/nombre de la tarea/i)).toBeInTheDocument()
      );

      fireEvent.change(screen.getByLabelText(/nombre de la tarea/i), {
        target: { value: "Tarea exitosa" },
      });

      fireEvent.click(screen.getByRole("button", { name: /crear/i }));

      await waitFor(() => {
        expect(screen.getByText("Tarea creada exitosamente")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Cerrar"));

      expect(reloadMock).toHaveBeenCalledTimes(1);
    });
  });

  // Cancelar 
  describe("Botón cancelar", () => {
    it("debería llamar a handleClose al cancelar", async () => {
      mockUseGlobalState.mockReturnValue([{ userid: 1, userRole: "teacher" }, jest.fn()]);
      mockGetGroups.getGroupsByUserId.mockResolvedValue([1]);
      mockGetGroups.getGroupById.mockResolvedValue(mockGroups[0]);

      const handleClose = jest.fn();
      renderForm({ handleClose });

      await waitFor(() => {
        expect(screen.getByText("Cancelar")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Cancelar"));

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it("debería cerrar el dialog de error sin recargar la página", async () => {
      mockUseGlobalState.mockReturnValue([{ userid: 1, userRole: "teacher" }, jest.fn()]);
      mockGetGroups.getGroupsByUserId.mockResolvedValue([1]);
      mockGetGroups.getGroupById.mockResolvedValue(mockGroups[0]);
      mockAssignmentsRepo.getAssignmentsByGroupid.mockResolvedValue([
        { id: 99, title: "Duplicada", groupid: 1 },
      ]);

      renderForm();

      await waitFor(() => expect(screen.getByLabelText(/nombre de la tarea/i)).toBeInTheDocument());

      fireEvent.change(screen.getByLabelText(/nombre de la tarea/i), {
        target: { value: "Duplicada" },
      });
      fireEvent.click(screen.getByRole("button", { name: /crear/i }));

      await waitFor(() => {
        expect(screen.getByText(/ya existe una tarea con el mismo nombre/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Cerrar"));

      // No recarga, solo cierra el dialog y vuelve al form
      expect(globalThis.location.reload).not.toHaveBeenCalled();
      await waitFor(() => {
        expect(screen.getByText("Crear tarea")).toBeInTheDocument();
      });
    });
  });

});
