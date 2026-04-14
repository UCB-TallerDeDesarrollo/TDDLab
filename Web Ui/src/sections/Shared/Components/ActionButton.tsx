import { Button } from "@mui/material";
import type { ButtonProps } from "@mui/material/Button";
import type { CSSProperties } from "react";

type ActionButtonSize = "default" | "compact";

interface ActionButtonProps extends ButtonProps {
  sizeVariant?: ActionButtonSize;
}

const actionButtonSizeStyles: Record<ActionButtonSize, CSSProperties> = {
  default: {
    fontSize: "15px",
    marginRight: "8px",
  },
  compact: {
    fontSize: "13px",
    marginRight: "6px",
  },
};

export const ActionButton = ({
  style,
  sizeVariant = "default",
  ...props
}: ActionButtonProps) => (
  <Button
    {...props}
    style={{
      textTransform: "none",
      ...actionButtonSizeStyles[sizeVariant],
      ...style,
    }}
  />
);
