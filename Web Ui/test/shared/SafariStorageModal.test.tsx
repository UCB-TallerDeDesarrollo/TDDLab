import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SafariStorageModal from "../../src/shared/components/SafariStorageModal";
import {
  hasBlockedSafariStorage,
  isSafari,
} from "../../src/shared/hooks/useSafariStorage";

const macSafari =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15";
const iosSafari =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1";

beforeEach(() => {
  jest.spyOn(navigator, "userAgent", "get").mockReturnValue(macSafari);
});

afterEach(() => jest.restoreAllMocks());

function blockCookies() {
  jest.spyOn(document, "cookie", "set").mockImplementation(() => {});
}

it.each([macSafari, iosSafari])(
  "shows the guide when Safari silently rejects cookies (%s)",
  (ua) => {
    jest.spyOn(navigator, "userAgent", "get").mockReturnValue(ua);
    blockCookies();
    render(<SafariStorageModal />);
    expect(
      screen.getByRole("dialog", { name: "Activa las cookies en Safari" }),
    ).toBeVisible();
    expect(screen.getByText(/Bloquear todas las cookies/)).toBeVisible();
  },
);

it("shows the guide when access to localStorage throws SecurityError", () => {
  jest.spyOn(window, "localStorage", "get").mockImplementation(() => {
    throw new DOMException("Blocked", "SecurityError");
  });
  render(<SafariStorageModal />);
  expect(screen.getByRole("dialog")).toBeVisible();
});

it("detects rejected localStorage writes", () => {
  jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {});
  expect(hasBlockedSafariStorage()).toBe(true);
});

it("does not show the guide when Safari storage works and cleans up its probes", () => {
  const cookies = document.cookie;
  const storageLength = localStorage.length;
  render(<SafariStorageModal />);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(document.cookie).toBe(cookies);
  expect(localStorage.length).toBe(storageLength);
});

it.each([
  "Chrome/120.0",
  "CriOS/120.0",
  "FxiOS/120.0",
  "EdgiOS/120.0",
  "OPiOS/120.0",
])("excludes other browsers (%s), even with blocked cookies", (browser) => {
  jest
    .spyOn(navigator, "userAgent", "get")
    .mockReturnValue(`${iosSafari} ${browser}`);
  blockCookies();
  render(<SafariStorageModal />);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

it("recognizes iPad desktop Safari", () => {
  expect(isSafari(macSafari)).toBe(true);
});

it("lets the user close the guide", async () => {
  blockCookies();
  render(<SafariStorageModal />);
  fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
});

it("keeps the guide open and explains a failed retry", () => {
  blockCookies();
  render(<SafariStorageModal />);
  fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
  expect(screen.getByRole("alert")).toHaveTextContent(
    "El almacenamiento sigue bloqueado",
  );
  expect(screen.getByRole("dialog")).toBeVisible();
});

it("reloads after a retry confirms storage is available", () => {
  const locationDescriptor = Object.getOwnPropertyDescriptor(
    window,
    "location",
  )!;
  const reload = jest.fn();
  Object.defineProperty(window, "location", {
    configurable: true,
    value: { reload },
  });
  try {
    blockCookies();
    render(<SafariStorageModal />);
    jest.restoreAllMocks();
    jest.spyOn(navigator, "userAgent", "get").mockReturnValue(macSafari);
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(reload).toHaveBeenCalledTimes(1);
  } finally {
    Object.defineProperty(window, "location", locationDescriptor);
  }
});
