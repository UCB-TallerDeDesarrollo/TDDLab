import { PracticeDataObject } from "../../../../src/modules/Practices/domain/PracticeInterface";
import {
  orderPractices,
  resolveMyPracticesPermissions,
  toPracticeListItems,
} from "../../../../src/features/my-practices/services/myPracticesScreenService";

const practices: PracticeDataObject[] = [
  {
    id: 2,
    title: "Beta",
    description: "Segunda practica",
    state: "pending",
    creation_date: new Date("2026-03-01T10:00:00.000Z"),
    userid: 7,
  },
  {
    id: 1,
    title: "Alpha",
    description: "Primera practica",
    state: "completed",
    creation_date: new Date("2026-02-01T10:00:00.000Z"),
    userid: 7,
  },
];

describe("myPracticesScreenService", () => {
  it("ordena practicas alfabeticamente de forma ascendente", () => {
    const result = orderPractices(practices, "A_Up_Order");

    expect(result.map((practice) => practice.title)).toEqual([
      "Alpha",
      "Beta",
    ]);
  });

  it("convierte practicas a view models para la lista", () => {
    const result = toPracticeListItems(practices);

    expect(result).toEqual([
      {
        id: 2,
        title: "Beta",
        description: "Segunda practica",
        state: "pending",
        creationDate: new Date("2026-03-01T10:00:00.000Z"),
        userid: 7,
      },
      {
        id: 1,
        title: "Alpha",
        description: "Primera practica",
        state: "completed",
        creationDate: new Date("2026-02-01T10:00:00.000Z"),
        userid: 7,
      },
    ]);
  });

  it("resuelve permisos de manejo para un estudiante", () => {
    expect(resolveMyPracticesPermissions("student")).toEqual({
      canManagePractices: true,
      canCreatePractices: true,
    });
  });
});
