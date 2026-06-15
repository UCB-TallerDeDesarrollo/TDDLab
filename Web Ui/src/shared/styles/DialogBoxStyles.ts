import { CSSProperties } from "react";

const dialogFontFamily = '"Inter", "Segoe UI", sans-serif';

export const dialogContentStyle: CSSProperties = {
  fontFamily: dialogFontFamily,
  fontSize: "15px",
  lineHeight: 1.5,
};

export const titleStyle: CSSProperties = {
  fontFamily: dialogFontFamily,
  fontSize: "1rem",
  fontWeight: "bold",
};

export const titleStyle2: CSSProperties = {
  fontFamily: dialogFontFamily,
  fontSize: "15.5px",
};

export const primaryButtonStyle: CSSProperties = {
  fontFamily: dialogFontFamily,
  textTransform: "none",
};

export const secondaryButtonStyle: CSSProperties = {
  fontFamily: dialogFontFamily,
  textTransform: "none",
  color: "#555",
};

export const neutralButtonStyle: CSSProperties = {
  fontFamily: dialogFontFamily,
  textTransform: "none",
  color: "#394150",
  borderColor: "#c9d0d8",
  borderWidth: "1px",
  borderStyle: "solid",
  padding: "5px 20px",
};

export const destructiveButtonStyle: CSSProperties = {
  fontFamily: dialogFontFamily,
  textTransform: "none",
  color: "#fff",
  backgroundColor: "#d32f2f",
  borderColor: "#d32f2f",
  borderWidth: "1px",
  borderStyle: "solid",
  padding: "5px 20px",
};
