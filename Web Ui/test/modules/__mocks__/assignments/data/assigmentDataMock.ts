import { AssignmentDataObject } from "../../../../../src/modules/Assignments/domain/assignmentInterfaces";

export const assignmentPendingDataMock: AssignmentDataObject = {
  id: 1,
  title: "Tarea pendiente",
  description: "Esta es una tarea pendiente",
  start_date: new Date("2023-01-01"),
  end_date: new Date("2023-01-10"),
  state: "pending",
  link: "",
  comment: "Comentario",
  groupid: 1,
};

export const assignmentInProgresDataMock: AssignmentDataObject = {
  id: 2,
  title: "Tarea en progreso",
  description: "Esta es una tarea en progreso",
  start_date: new Date("2023-01-01"),
  end_date: new Date("2023-01-10"),
  state: "in progress",
  link: "",
  comment: "Comentario",
  groupid: 1,
};
