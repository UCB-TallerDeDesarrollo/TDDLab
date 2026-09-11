import { useState, useCallback } from "react";

type SnackbarSeverity = "success" | "error" | "warning" | "info";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
}

interface UseSnackbarFeedbackReturn {
  snackbar: SnackbarState;
  showSuccess: (message?: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
  handleClose: () => void;
}

export function useSnackbarFeedback(): UseSnackbarFeedbackReturn {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const show = useCallback(
    (message: string, severity: SnackbarSeverity = "success") => {
      setSnackbar({ open: true, message, severity });
    },
    []
  );

  const showSuccess = useCallback((message = "Operación exitosa") => {
    show(message, "success");
  }, [show]);

  const showError = useCallback((message: string) => {
    show(message, "error");
  }, [show]);

  const showWarning = useCallback((message: string) => {
    show(message, "warning");
  }, [show]);

  const showInfo = useCallback((message: string) => {
    show(message, "info");
  }, [show]);

  const handleClose = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  return {
    snackbar,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    handleClose,
  };
}
