import { AssignmentDataObject } from "../../../../src/modules/Assignments/domain/Assignment";

export const assignmentList: AssignmentDataObject[] = [
    {
      title: "Tarea 1",
      description: "Esta es la primera tarea",
      start_date: new Date("2023-01-01"),
      end_date: new Date("2023-01-10"),
      state: "pending",
    },
    {
      title: "Tarea 2",
      description: "Esta es la segunda tarea",
      start_date: new Date("2023-02-15"),
      end_date: new Date("2023-02-28"),
      state: "delivered",
    }
  ];