import { CircularProgress } from "@mui/material";
import "./FullScreenLoader.css";
import React from "react";

interface FullScreenLoaderProps {
  isLoading?: boolean;
}

/**
 * Componente genérico para mostrar una pantalla de carga a pantalla completa.
 * Reemplaza los <div> con estilos inline para centrado de pantalla.
 * 
 * @param {FullScreenLoaderProps} props - Propiedades del componente
 * @param {boolean} props.isLoading - Determina si el loader debe ser visible
 * @returns {JSX.Element | null} Elemento de loader o null si no está cargando
 */
const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ isLoading = true }) => {
  if (!isLoading) {
    return null;
  }

  return (
    <div className="fullscreen-loader" aria-label="Cargando sesión">
      <CircularProgress />
    </div>
  );
};

export default FullScreenLoader;
