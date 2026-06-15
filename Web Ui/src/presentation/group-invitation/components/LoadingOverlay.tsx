import { CircularProgress } from "@mui/material";

export default function LoadingOverlay() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 99999,
        backdropFilter: "blur(5px)",
      }}
    >
      <CircularProgress size={60} />
    </div>
  );
}
