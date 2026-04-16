import { HomeFeatureLink, HomeViewModel } from "../types/home.types";

const featureLinks: HomeFeatureLink[] = [
  {
    title: "Grupos",
    path: "/groups",
    access: ["admin", "teacher"],
  },
  {
    title: "Tareas",
    path: "/tareas",
    access: ["admin", "student", "teacher"],
  },
  {
    title: "Mis prácticas",
    path: "/mis-practicas",
    access: ["admin", "teacher", "student"],
  },
  {
    title: "Usuarios",
    path: "/user",
    access: ["admin", "teacher"],
  },
];

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

function getAvailableLinks(role?: string): HomeFeatureLink[] {
  if (!role) {
    return [];
  }

  return featureLinks.filter((link) => link.access.includes(role));
}

export function buildHomeViewModel(
  email?: string,
  role?: string,
): HomeViewModel {
  const displayName = normalizeDisplayName(email);

  return {
    greeting: `Hola ${displayName}, bienvenido al TDD Lab!!!`,
    availableLinks: getAvailableLinks(role),
  };
}
