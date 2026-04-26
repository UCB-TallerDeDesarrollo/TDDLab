import { CircularProgress, Typography } from "@mui/material";
import { ViewState } from "../types";

interface ContentStateProps {
  state: ViewState;
  loadingTestId?: string;
  errorMessage?: string;
  emptyMessage?: string;
  className?: string;
}

export function ContentState({
  state,
  loadingTestId,
  errorMessage,
  emptyMessage,
  className,
}: Readonly<ContentStateProps>) {
  if (state === "loading") {
    return (
      <div className={className}>
        <CircularProgress size={60} thickness={5} data-testid={loadingTestId} />
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className={className}>
        <Typography color="error">{errorMessage ?? "Error al cargar."}</Typography>
      </div>
    );
  }

  if (state === "empty") {
    return (
      <div className={className}>
        <Typography color="text.secondary">{emptyMessage ?? "Sin resultados."}</Typography>
      </div>
    );
  }

  return null;
}
