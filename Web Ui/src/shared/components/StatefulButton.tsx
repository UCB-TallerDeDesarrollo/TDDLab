import Button, { ButtonProps } from "@mui/material/Button";
import { styled } from "@mui/material/styles";

interface StatefulButtonProps extends ButtonProps {
  variantStyle?: "primary" | "secondary";
}

const StyledStatefulButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "variantStyle",
})<StatefulButtonProps>(({ variantStyle = "secondary" }) => {
  const isPrimary = variantStyle === "primary";
  return {
    minWidth: 88,
    height: 34,
    borderRadius: 5,
    padding: "10px",
    fontFamily: "Inter, sans-serif",
    fontSize: 14,
    fontWeight: 700,
    lineHeight: "100%",
    letterSpacing: "0%",
    textTransform: "none",
    boxShadow: "none",
    border: "none",
    color: "#FFFFFF",
    backgroundColor: isPrimary ? "#1370d2" : "#898989",
    transition: "background-color 0.2s ease, transform 0.1s ease",
    "& .MuiButton-startIcon": {
      marginRight: 6,
      marginLeft: 0,
      color: "#FFFFFF",
      "& > *:nth-of-type(1)": {
        fontSize: 17,
      },
    },
    "&:hover": {
      boxShadow: "none",
      backgroundColor: isPrimary ? "#002346" : "#353535",
      color: "#FFFFFF",
    },
    "&:active": {
      transform: "scale(0.98)",
    },
    "&.Mui-disabled": {
      backgroundColor: "#818181",
      color: "#FFFFFF",
    },
  };
});

function StatefulButton({
  children,
  variantStyle = "secondary",
  ...props
}: Readonly<StatefulButtonProps>) {
  return (
    <StyledStatefulButton variantStyle={variantStyle} {...props}>
      {children}
    </StyledStatefulButton>
  );
}

export default StatefulButton;
