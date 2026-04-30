export const editAssignmentStyles = {
  titleField: {
    marginTop: 2,
    "& .MuiInputBase-input": {
      paddingTop: "14px",
    },
  },
  descriptionField: {
    "& label.Mui-focused": {
      color: "#001F3F",
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#001F3F",
      },
    },
  },
  saveButton: {
    textTransform: "none" as const,
  },
  errorTitle: {
    color: "#dc3545",
    fontWeight: "bold",
    fontSize: "18px",
  },
  errorMessage: {
    color: "#dc3545",
    fontWeight: "bold",
    fontSize: "16px",
    textAlign: "center" as const,
  },
};