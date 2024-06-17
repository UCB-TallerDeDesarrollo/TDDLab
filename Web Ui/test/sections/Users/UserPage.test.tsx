import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import UserPage from "../../../src/sections/User/UserPage";
import "@testing-library/jest-dom";
import GetUsers from "../../../src/modules/Users/application/getUsers";
import GetGroups from "../../../src/modules/Groups/application/GetGroups";
import { UserDataObject } from "../../../src/modules/Users/domain/UsersInterface";
import { GroupDataObject } from "../../../src/modules/Groups/domain/GroupInterface";

// Mock implementations
jest.mock("../../../src/modules/Users/application/getUsers");
jest.mock("../../../src/modules/Groups/application/GetGroups");

const mockUsers: UserDataObject[] = [
  { id: 1, email: "user1@example.com", role: "admin", groupid: 1 },
  { id: 2, email: "user2@example.com", role: "user", groupid: 2 },
];

const mockGroups: GroupDataObject[] = [
  {
    id: 1,
    groupName: "Group1",
    groupDetail: "Detail1",
    creationDate: new Date(),
  },
  {
    id: 2,
    groupName: "Group2",
    groupDetail: "Detail2",
    creationDate: new Date(),
  },
];

describe("UserPage component", () => {
  beforeEach(() => {
    // Mocking the getUsers and getGroups methods
    (GetUsers.prototype.getUsers as jest.Mock).mockResolvedValue(mockUsers);
    (GetGroups.prototype.getGroups as jest.Mock).mockResolvedValue(mockGroups);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("renders users table after successful data fetch", async () => {
    render(<UserPage />);

    // Verify loading indicator is displayed
    expect(screen.getByRole("progressbar")).toBeInTheDocument();

    // Wait for data fetching to complete
    await waitFor(() => {
      expect(screen.getByText("user1@example.com")).toBeInTheDocument();
      expect(screen.getByText("Group1")).toBeInTheDocument();
      expect(screen.getByText("admin")).toBeInTheDocument();
      expect(screen.getByText("user2@example.com")).toBeInTheDocument();
      expect(screen.getByText("Group2")).toBeInTheDocument();
      expect(screen.getByText("user")).toBeInTheDocument();
    });
  });

  it("filters users when selecting a group", async () => {
    render(<UserPage />);

    // Espera a que se complete la carga inicial de datos
    await waitFor(() => {
      expect(screen.getByText("user1@example.com")).toBeInTheDocument();
      expect(screen.getByText("user2@example.com")).toBeInTheDocument();
    });

    // Abrimos el menú desplegable
    const selectElement = screen.getByLabelText(/Grupo/i);
    fireEvent.mouseDown(selectElement);

    // Seleccionamos el grupo deseado
    const menuItem = await screen.findAllByRole("option"); // Obtenemos todos los elementos del menú
    fireEvent.click(menuItem[1]); // Aquí seleccionamos el segundo elemento, que es "Group1"

    // Verificamos que solo se muestren usuarios del grupo seleccionado
    await waitFor(() => {
      expect(screen.getByText("user1@example.com")).toBeInTheDocument();
      expect(screen.queryByText("user2@example.com")).not.toBeInTheDocument();
    });

    // Seleccionamos "Todos los grupos" para mostrar todos los usuarios nuevamente
    fireEvent.mouseDown(selectElement); // Abrimos el menú desplegable
    const allGroupsItem = await screen.findByText("Todos los grupos");
    fireEvent.click(allGroupsItem);

    // Verificamos que todos los usuarios estén visibles nuevamente
    await waitFor(() => {
      expect(screen.getByText("user1@example.com")).toBeInTheDocument();
      expect(screen.getByText("user2@example.com")).toBeInTheDocument();
    });
    
  });

  it("displays error message if fetching users fails", async () => {
    (GetUsers.prototype.getUsers as jest.Mock).mockRejectedValueOnce(
      new Error("Failed to fetch users")
    );

    render(<UserPage />);

    // Wait for error message to be displayed
    await waitFor(() => {
      expect(
        screen.getByText(/Error: Failed to fetch users/i)
      ).toBeInTheDocument();
    });
  });
});
