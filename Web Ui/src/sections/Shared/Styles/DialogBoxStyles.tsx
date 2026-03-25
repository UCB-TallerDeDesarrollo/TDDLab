import { CSSProperties } from "react";
import { typographyVariants } from "../../../styles/typography";

export const dialogContentStyle: CSSProperties = {
  ...typographyVariants.paragraphMedium,
};

export const titleStyle: CSSProperties = {
  ...typographyVariants.h5,
};

export const titleStyle2: CSSProperties = {
  ...typographyVariants.paragraphMedium,
};

export const primaryButtonStyle: CSSProperties = {
  textTransform: "none",
};

export const secondaryButtonStyle: CSSProperties = {
  textTransform: "none",
  color: "#555",
};
