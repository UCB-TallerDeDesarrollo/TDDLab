export const styles = {
  validationDialog: {
    title: {
      base: {
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        fontSize: "1rem",
        fontWeight: 400,
        py: 2,
        fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
      },
      error: { color: "#d32f2f" },
      success: { color: "#2e7d32" },
    },
    icon: {
      error: { color: "#d32f2f", fontSize: 22 },
      success: { color: "#2e7d32", fontSize: 22 },
    },
    actions: { pb: 2, pr: 2 },
    closeButton: {
      error: { color: "#d32f2f", textTransform: "none" as const, fontSize: "0.875rem" },
      success: { color: "#2e7d32", textTransform: "none" as const, fontSize: "0.875rem" },
    },
  },
  form: {
    dialogTitle: { fontSize: "0.8rem" },
    cancelButton: { color: "#555", textTransform: "none" as const },
    createButton: { textTransform: "none" as const },
  },
};