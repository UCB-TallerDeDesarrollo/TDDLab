export type StudentSubmissionLoadState =
  | "loading"
  | "empty"
  | "success"
  | "error";

export type StudentAssignmentStatusVariant =
  | "pending"
  | "progress"
  | "sent"
  | "neutral"
  | "error";

export interface StudentAssignmentActionState {
  statusLabel: string;
  statusVariant: StudentAssignmentStatusVariant;
  showStart: boolean;
  showFinish: boolean;
  showGraph: boolean;
}

interface StudentSubmissionSummary {
  status: string;
  repository_link: string;
}

const noActions = (
  statusLabel: string,
  statusVariant: StudentAssignmentStatusVariant
): StudentAssignmentActionState => ({
  statusLabel,
  statusVariant,
  showStart: false,
  showFinish: false,
  showGraph: false,
});

export function getStudentAssignmentActionState(
  loadState: StudentSubmissionLoadState,
  submission: StudentSubmissionSummary | null
): StudentAssignmentActionState {
  if (loadState === "loading") {
    return noActions("Cargando...", "neutral");
  }

  if (loadState === "error") {
    return noActions("No se pudo cargar la entrega", "error");
  }

  if (loadState === "empty" || submission === null) {
    return {
      statusLabel: "Pendiente",
      statusVariant: "pending",
      showStart: true,
      showFinish: false,
      showGraph: false,
    };
  }

  const hasRepository = Boolean(submission.repository_link);

  if (submission.status === "in progress") {
    return {
      statusLabel: "En progreso",
      statusVariant: "progress",
      showStart: false,
      showFinish: hasRepository,
      showGraph: hasRepository,
    };
  }

  if (submission.status === "delivered") {
    return {
      statusLabel: "Enviado",
      statusVariant: "sent",
      showStart: false,
      showFinish: false,
      showGraph: hasRepository,
    };
  }

  return noActions("Estado no disponible", "neutral");
}
