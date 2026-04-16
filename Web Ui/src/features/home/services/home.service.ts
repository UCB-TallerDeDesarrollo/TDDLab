import { HomeViewModel } from "../types/home.types";

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

export function buildHomeViewModel(email?: string): HomeViewModel {
  const displayName = normalizeDisplayName(email);

  return {
    greeting: `Hola ${displayName}, bienvenido al TDD Lab!!!`,
  };
}
