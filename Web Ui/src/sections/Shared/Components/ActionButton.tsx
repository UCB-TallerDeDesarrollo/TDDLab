import { Button } from "@mui/material";
import type { ButtonProps } from "@mui/material/Button";

export const ActionButton = ({ style, ...props }: ButtonProps) => (
  <Button
    {...props}
    style={{ textTransform: "none", fontSize: "15px", marginRight: "8px", ...style }}
  />
);
