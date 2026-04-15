import { CircularProgress } from "@mui/material";
import "./FullScreenLoader.css";
import React from "react";

interface FullScreenLoaderProps {
  isLoading?: boolean;
  variant?: 'fullscreen' | 'overlay';
  blur?: boolean;
}

const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({
  isLoading = true,
  variant = 'fullscreen',
  blur = false,
}) => {
  if (!isLoading) {
    return null;
  }

  if (variant === 'overlay') {
    return (
      <div
        className={`saving-overlay${blur ? ' saving-overlay--blur' : ''}`}
        aria-label="Guardando..."
      >
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="fullscreen-loader" aria-label="Cargando sesión">
      <CircularProgress />
    </div>
  );
};

export default FullScreenLoader;
