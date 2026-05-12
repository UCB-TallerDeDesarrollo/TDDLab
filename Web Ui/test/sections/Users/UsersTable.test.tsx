import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import UsersTable from "../../../src/sections/User/UsersTable";

describe("UsersTable", () => {
  const users = [
    {
      id: 1,
      email: "usuario1@test.com",
      groupid: 10,
      role: "student",
    },
    {
      id: 2,
      email: "usuario2@test.com",
      groupid: 20,
      role: "teacher",
    },
  ];

  const groupMap = {
    10: "Grupo A",
    20: "Grupo B",
  };

  it("renderiza las columnas de la tabla", () => {
    render(<UsersTable users={[]} groupMap={{}} onRemoveUser={jest.fn()} />);

    expect(screen.getByText("Correo")).toBeInTheDocument();
    expect(screen.getByText("Grupo")).toBeInTheDocument();
    expect(screen.getByText("Rol")).toBeInTheDocument();
    expect(screen.getByText("Eliminar")).toBeInTheDocument();
  });

  it("muestra los usuarios recibidos", () => {
    render(
      <UsersTable users={users} groupMap={groupMap} onRemoveUser={jest.fn()} />
    );

    expect(screen.getByText("usuario1@test.com")).toBeInTheDocument();
    expect(screen.getByText("usuario2@test.com")).toBeInTheDocument();
    expect(screen.getByText("Grupo A")).toBeInTheDocument();
    expect(screen.getByText("Grupo B")).toBeInTheDocument();
    expect(screen.getByText("student")).toBeInTheDocument();
    expect(screen.getByText("teacher")).toBeInTheDocument();
  });

  it("muestra Unknown cuando no existe el grupo en groupMap", () => {
    render(
      <UsersTable
        users={[
          {
            id: 3,
            email: "sin-grupo@test.com",
            groupid: 99,
            role: "student",
          },
        ]}
        groupMap={{}}
        onRemoveUser={jest.fn()}
      />
    );

    expect(screen.getByText("Unknown")).toBeInTheDocument();
  });

  it("muestra mensaje cuando no hay usuarios", () => {
    render(<UsersTable users={[]} groupMap={{}} onRemoveUser={jest.fn()} />);

    expect(screen.getByText("No se encontraron resultados")).toBeInTheDocument();
  });

  it("llama onRemoveUser con el id correcto al hacer click en eliminar", () => {
    const onRemoveUserMock = jest.fn();

    render(
      <UsersTable users={users} groupMap={groupMap} onRemoveUser={onRemoveUserMock} />
    );

    const deleteIcons = screen.getAllByTestId("RemoveCircleIcon");

    fireEvent.click(deleteIcons[0]);

    expect(onRemoveUserMock).toHaveBeenCalledTimes(1);
    expect(onRemoveUserMock).toHaveBeenCalledWith(1);
  });
});