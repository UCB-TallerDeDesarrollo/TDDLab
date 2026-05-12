import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import UsersByGroupPage from "../../../src/sections/User/UserBygroupPage";

// Mocks
const mockExecute = jest.fn();
const mockObtainGroupDetail = jest.fn();

jest.mock("../../../src/modules/Users/application/getUsersByGroupid", () => {
  return jest.fn().mockImplementation(() => ({
    execute: mockExecute,
  }));
});

jest.mock("../../../src/modules/Groups/application/GetGroupDetail", () => {
  return {
    GetGroupDetail: jest.fn().mockImplementation(() => ({
      obtainGroupDetail: mockObtainGroupDetail,
    })),
  };
});

jest.mock("../../../src/modules/Users/repository/UsersRepository", () => {
  return jest.fn().mockImplementation(() => ({}));
});

jest.mock("../../../src/modules/Groups/repository/GroupsRepository", () => {
  return jest.fn().mockImplementation(() => ({}));
});

describe("UsersByGroupPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("muestra Loading al inicio", () => {
    mockObtainGroupDetail.mockResolvedValue({ id: 1, groupName: "Grupo Test" });
    mockExecute.mockResolvedValue([]);

    render(
      <MemoryRouter initialEntries={["/users/group/1"]}>
        <Routes>
          <Route path="/users/group/:groupid" element={<UsersByGroupPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("carga grupo y usuarios", async () => {
    mockObtainGroupDetail.mockResolvedValue({
      id: 1,
      groupName: "Grupo Test",
    });

    mockExecute.mockResolvedValue([
      { id: 1, email: "test1@test.com" },
      { id: 2, email: "test2@test.com" },
    ]);

    render(
      <MemoryRouter initialEntries={["/users/group/1"]}>
        <Routes>
          <Route path="/users/group/:groupid" element={<UsersByGroupPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Grupo Test")).toBeInTheDocument();
    });

    expect(screen.getByText("test1@test.com")).toBeInTheDocument();
    expect(screen.getByText("test2@test.com")).toBeInTheDocument();
  });

  it("llama a los servicios con el id correcto", async () => {
    mockObtainGroupDetail.mockResolvedValue({
      id: 5,
      groupName: "Grupo 5",
    });

    mockExecute.mockResolvedValue([{ id: 1, email: "user@test.com" }]);

    render(
      <MemoryRouter initialEntries={["/users/group/5"]}>
        <Routes>
          <Route path="/users/group/:groupid" element={<UsersByGroupPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockObtainGroupDetail).toHaveBeenCalledWith(5);
      expect(mockExecute).toHaveBeenCalledWith(5);
    });
  });
});