import {
  getStudentAssignmentActionState,
  type StudentSubmissionLoadState,
} from "../../../../src/presentation/assignments/services/assignmentActionState";

describe("getStudentAssignmentActionState", () => {
  const getState = (
    loadState: StudentSubmissionLoadState,
    submission: { status: string; repository_link: string } | null
  ) => getStudentAssignmentActionState(loadState, submission);

  it("muestra solo la acción para iniciar cuando no existe una entrega", () => {
    expect(getState("empty", null)).toEqual({
      statusLabel: "Pendiente",
      statusVariant: "pending",
      showStart: true,
      showFinish: false,
      showGraph: false,
    });
  });

  it("permite finalizar y ver la gráfica para una entrega en progreso con repositorio", () => {
    expect(
      getState("success", {
        status: "in progress",
        repository_link: "https://github.com/student/practice",
      })
    ).toEqual({
      statusLabel: "En progreso",
      statusVariant: "progress",
      showStart: false,
      showFinish: true,
      showGraph: true,
    });
  });

  it("mantiene solamente la gráfica para una entrega finalizada", () => {
    expect(
      getState("success", {
        status: "delivered",
        repository_link: "https://github.com/student/practice",
      })
    ).toEqual({
      statusLabel: "Enviado",
      statusVariant: "sent",
      showStart: false,
      showFinish: false,
      showGraph: true,
    });
  });

  it("no habilita acciones mientras se carga la entrega", () => {
    expect(getState("loading", null)).toEqual({
      statusLabel: "Cargando...",
      statusVariant: "neutral",
      showStart: false,
      showFinish: false,
      showGraph: false,
    });
  });

  it("no habilita acciones si no se pudo cargar la entrega", () => {
    expect(getState("error", null)).toEqual({
      statusLabel: "No se pudo cargar la entrega",
      statusVariant: "error",
      showStart: false,
      showFinish: false,
      showGraph: false,
    });
  });

  it("no permite finalizar ni ver la gráfica si falta el repositorio", () => {
    expect(
      getState("success", {
        status: "in progress",
        repository_link: "",
      })
    ).toEqual({
      statusLabel: "En progreso",
      statusVariant: "progress",
      showStart: false,
      showFinish: false,
      showGraph: false,
    });
  });
});
