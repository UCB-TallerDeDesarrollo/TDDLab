// PracticeCard.styles.ts
import { SxProps, Theme } from "@mui/material/styles";

export const practiceCardStyles = {
  // Estilos del contenedor principal
  container: {
    height: "auto",
    display: "flex",
    flexDirection: "column",
    cursor: "pointer",
    borderRadius: "12px",
    transition: "all 0.32s cubic-bezier(0.4, 0, 0.2, 1)",
    border: "1px solid",
    borderColor: "#E7E7E7",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    position: "relative",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "3px",
      backgroundColor: "#1565c0",
      transform: "scaleX(0)",
      transformOrigin: "left",
      transition: "transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)",
    },
    "&:hover": {
      borderColor: "#D0D0D0",
      backgroundColor: "#F5F7FA",
      boxShadow: "0 12px 28px rgba(0, 0, 0, 0.12)",
      transform: "translateY(-6px)",
      "&::before": {
        transform: "scaleX(1)",
      },
    },
  } as SxProps<Theme>,

  // Estilos del contenido para layout de fila (ancho completo apilado)
  cardContentStacked: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    gap: "16px",
  } as SxProps<Theme>,

  // Contenedor principal que agrupa contenido + acciones
  mainContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    gap: "24px",
  } as SxProps<Theme>,

  // Estilos del contenido anterior (para compatibilidad)
  cardContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "20px",
    gap: "16px",
  } as SxProps<Theme>,

  // Contenedor del título y descripción
  titleDescriptionBox: {
    flex: 1,
    minHeight: "auto",
  } as SxProps<Theme>,

  // Estilos de título
  title: {
    color: "#212121",
    marginBottom: "6px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: "18px",
    fontWeight: 700,
    fontFamily: '"Afacad", "Segoe UI", sans-serif',
    letterSpacing: "0.5px",
  },

  // Descripción para layout apilado (una línea)
  descriptionStacked: {
    color: "#676767",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: "15px",
    fontFamily: '"Afacad", "Segoe UI", sans-serif',
    lineHeight: "1.4",
  },

  // Estilos de descripción (para compatibilidad)
  description: {
    color: "#676767",
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    minHeight: "40px",
    fontSize: "14px",
    fontFamily: '"Afacad", "Segoe UI", sans-serif',
    lineHeight: "1.5",
  },

  // Contenedor de acciones para layout apilado (horizontal, derecha)
  actionsContainerStacked: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "6px",
    flexShrink: 0,
    minHeight: "36px",
  } as SxProps<Theme>,

  // Contenedor de acciones anterior (para compatibilidad)
  actionsContainer: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "4px",
    paddingTop: "16px",
    marginTop: "8px",
    borderTop: "1px solid #F0F0F0",
    minHeight: "40px",
  } as SxProps<Theme>,

  // Botones de acción
  actionButton: {
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    padding: "6px",
    borderRadius: "6px",
    "&:hover": {
      backgroundColor: "rgba(21, 101, 192, 0.1)",
      transform: "scale(1.12)",
    },
    "&:active": {
      transform: "scale(0.95)",
    },
  } as SxProps<Theme>,

  actionButtonDelete: {
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    padding: "6px",
    borderRadius: "6px",
    "&:hover": {
      backgroundColor: "rgba(211, 47, 47, 0.1)",
      transform: "scale(1.12)",
    },
    "&:active": {
      transform: "scale(0.95)",
    },
  } as SxProps<Theme>,

  actionButtonStatus: {
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    padding: "6px",
    borderRadius: "6px",
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.08)",
      transform: "scale(1.12)",
    },
    "&:active": {
      transform: "scale(0.95)",
    },
  } as SxProps<Theme>,
} as const;

export default practiceCardStyles;
