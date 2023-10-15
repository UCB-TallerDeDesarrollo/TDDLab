import { AssignmentDataObject } from "../../../../src/modules/Assignments/domain/Assignment";

export const assignment: AssignmentDataObject = 
{
  title: "Tarea 1",
  description: "Esta es la primera tarea",
  start_date: new Date("2023-01-01"),
  end_date: new Date("2023-01-10"),
  state: "pending",
};