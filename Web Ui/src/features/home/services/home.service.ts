import { HomeAuthData, HomeViewModel } from "../types/home.types";

function normalizeDisplayName(email?: string): string {
  if (!email) {
    return "usuario";
  }

  const [localPart] = email.split("@");
  const [firstSegment] = localPart.split(/[._-]/);
  const cleanedName = firstSegment.trim();

  if (!cleanedName) {
    return "usuario";
  }

  return `${cleanedName.charAt(0).toUpperCase()}${cleanedName
    .slice(1)
    .toLowerCase()}`;
}

export function buildHomeViewModel(authData: HomeAuthData): HomeViewModel {
  if (authData.userId === undefined) {
    return {
      viewState: "loading",
      stateTitle: "Cargando inicio",
      stateDescription: "Estamos preparando tu página de entrada al TDD Lab.",
    };
  }

  if (authData.email === undefined) {
    return {
      viewState: "error",
      stateTitle: "No se pudo cargar la página de inicio",
      stateDescription:
        "No fue posible obtener los datos de la sesión autenticada.",
    };
  }

  if (authData.email.trim() === "") {
    return {
      viewState: "empty",
      stateTitle: "No hay datos de usuario",
      stateDescription:
        "Inicia sesión nuevamente para ver la página de inicio.",
    };
  }

  const displayName = normalizeDisplayName(authData.email);

  return {
    viewState: "success",
    greeting: `Hola ${displayName}, bienvenido al TDD Lab!!!`,
  };
}
