import { ReactNode } from "react";
import Tooltip from "@mui/material/Tooltip";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";

type ActionType = "edit" | "duplicate" | "groups" | "link" | "view" | "delete" | "suggestion" | "default";

interface AnimatedIconProps extends Omit<IconButtonProps, "color"> {
  title: string;
  icon: ReactNode;
  actionType?: ActionType;
  customColor?: string;
}

const ACTION_COLORS: Record<ActionType, string> = {
  edit: "#097F5F",
  duplicate: "#CE9A00",
  groups: "#006B61",
  link: "#355AA1",
  view: "#355AA1",
  delete: "#890909",
  suggestion: "#BB900C",
  default: "#002346", // Fallback color
};

export default function AnimatedIcon({
  title,
  icon,
  actionType = "default",
  customColor,
  ...iconButtonProps
}: AnimatedIconProps) {
  const hoverColor = customColor || ACTION_COLORS[actionType];

  return (
    <Tooltip
      title={title}
      arrow
      componentsProps={{
        tooltip: {
          sx: { bgcolor: "#002346", color: "white" },
        },
      }}
    >
      <span style={{ display: "inline-flex" }}>
        <IconButton
          {...iconButtonProps}
          sx={{
            color: "#002346", // Base color from original ActionIcon
            transition: "all 0.2s",
            "&:hover": {
              color: iconButtonProps.disabled ? "inherit" : hoverColor,
              filter: iconButtonProps.disabled ? "none" : `drop-shadow(0px 0px 8px ${hoverColor})`,
              backgroundColor: iconButtonProps.disabled ? "transparent" : "rgba(0, 35, 70, 0.08)",
            },
            ...iconButtonProps.sx,
          }}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  );
}
