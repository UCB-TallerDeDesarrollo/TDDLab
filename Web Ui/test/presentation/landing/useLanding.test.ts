import { renderHook, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useLanding } from "../../../src/presentation/landing/hooks/useLanding";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("useLanding", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("goToAuth navigates to /login", () => {
    const { result } = renderHook(() => useLanding(), {
      wrapper: MemoryRouter,
    });

    act(() => {
      result.current.goToAuth();
    });

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});

