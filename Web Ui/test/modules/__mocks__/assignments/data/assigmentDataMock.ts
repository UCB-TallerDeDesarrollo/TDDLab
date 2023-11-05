import { AssignmentDataObject } from "../../../../../src/modules/Assignments/domain/assignmentInterfaces";

export const assignmentDataMock: AssignmentDataObject = {
    id: 1,
    title: "Título de la Asignación",
    description: "Descripción de la Asignación",
    start_date: new Date("2023-01-01"),
    end_date: new Date("2023-01-10"),
    state: "pending",
    link: "Enlace",
    comment: "Comentario",
};