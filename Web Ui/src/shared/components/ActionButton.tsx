import Button, { ButtonProps } from "@mui/material/Button";
import { styled } from "@mui/material/styles";

interface ActionButtonProps extends ButtonProps {
  variantStyle?: "primary" | "secondary";
}

const StyledActionButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "variantStyle",
})<ActionButtonProps>(({ theme, variantStyle = "secondary" }) => ({
  minWidth: 88,
  height: 34,
  borderRadius: 5,
  paddingInline: theme.spacing(1.25),
  fontSize: 14,
  fontWeight: 700,
  lineHeight: "17px",
  textTransform: "none",
  boxShadow: "none",
  border: `0.5px solid ${
    variantStyle === "primary" ? theme.palette.primary.main : "#2F2F2F"
  }`,
  color: variantStyle === "primary" ? theme.palette.common.white : "#111111",
  backgroundColor:
    variantStyle === "primary" ? theme.palette.primary.main : "#D9D9D9",
  transition: "background-color 0.2s ease, color 0.2s ease, transform 0.1s",
  "& .MuiButton-startIcon": {
    marginRight: 6,
    marginLeft: 0,
    "& > *:nth-of-type(1)": {
      fontSize: 17,
    },
  },
  "&:hover, &:active": {
    boxShadow: "none",
    backgroundColor:
      variantStyle === "primary" ? "#002346" : "#5C5C5C",
    color: "#FFFFFF",
    "& .MuiButton-startIcon": {
      color: "#FFFFFF",
    },
  },
  "&:active": {
    transform: "scale(0.98)",
  },
}));

function ActionButton({
  children,
  variantStyle = "secondary",
  ...props
}: Readonly<ActionButtonProps>) {
  return (
    <StyledActionButton variantStyle={variantStyle} {...props}>
      {children}
    </StyledActionButton>
  );
}

export default ActionButton;
