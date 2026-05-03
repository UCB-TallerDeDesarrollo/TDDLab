import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import UsersHeader from "../../../src/sections/User/UsersHeader";
import { GroupDataObject } from "../../../src/modules/Groups/domain/GroupInterface";

describe("UsersHeader", () => {
  const groups: GroupDataObject[] = [
    {
      id: 1,
      groupName: "Grupo A",
      groupDetail: "Detalle Grupo A",
      creationDate: new Date("2024-01-01"),
    },
    {
      id: 2,
      groupName: "Grupo B",
      groupDetail: "Detalle Grupo B",
      creationDate: new Date("2024-01-02"),
    },
  ];

  it("renderiza el título y controles", () => {
    render(
      <UsersHeader
        searchQuery=""
        selectedGroup="all"
        groups={groups}
        onSearchChange={jest.fn()}
        onGroupChange={jest.fn()}
      />
    );

    expect(screen.getByText("Usuarios")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Buscar por email")).toBeInTheDocument();
    expect(screen.getByText("Filtrar todos los grupos")).toBeInTheDocument();
  });

  it("llama onSearchChange al escribir", () => {
    const onSearchChangeMock = jest.fn();

    render(
      <UsersHeader
        searchQuery=""
        selectedGroup="all"
        groups={groups}
        onSearchChange={onSearchChangeMock}
        onGroupChange={jest.fn()}
      />
    );

    const input = screen.getByPlaceholderText("Buscar por email");

    fireEvent.change(input, { target: { value: "test@email.com" } });

    expect(onSearchChangeMock).toHaveBeenCalledTimes(1);
    expect(onSearchChangeMock).toHaveBeenCalledWith("test@email.com");
  });

  it("muestra los grupos en el select", () => {
    render(
      <UsersHeader
        searchQuery=""
        selectedGroup="all"
        groups={groups}
        onSearchChange={jest.fn()}
        onGroupChange={jest.fn()}
      />
    );

    // abrir select (MUI)
    fireEvent.mouseDown(screen.getByRole("combobox"));

    expect(screen.getByText("Grupo A")).toBeInTheDocument();
    expect(screen.getByText("Grupo B")).toBeInTheDocument();
  });

  it("llama onGroupChange al seleccionar un grupo", () => {
    const onGroupChangeMock = jest.fn();

    render(
      <UsersHeader
        searchQuery=""
        selectedGroup="all"
        groups={groups}
        onSearchChange={jest.fn()}
        onGroupChange={onGroupChangeMock}
      />
    );

    fireEvent.mouseDown(screen.getByRole("combobox"));

    fireEvent.click(screen.getByText("Grupo A"));

    expect(onGroupChangeMock).toHaveBeenCalledTimes(1);
    expect(onGroupChangeMock).toHaveBeenCalledWith(1);
  });
});