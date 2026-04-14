const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  "in progress": "En progreso",
  delivered: "Enviado",
};

export const getSubmissionStatusLabel = (status?: string) => {
  if (!status) {
    return "Pendiente";
  }

  return statusLabels[status] ?? status;
};
