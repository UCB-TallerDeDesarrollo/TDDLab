import { useMemo } from "react";
import { typographyVariants } from "../../../styles/typography";

export const useAssignmentDetailStyles = () => {
  const actionButtonStyle = useMemo(
    () => ({
      textTransform: "none",
      ...typographyVariants.paragraphMedium,
      marginRight: "8px",
    }),
    []
  );

  const detailTextStyle = useMemo(
    () => ({
      ...typographyVariants.paragraphBig,
      lineHeight: "1.8",
    }),
    []
  );

  return { actionButtonStyle, detailTextStyle };
};
