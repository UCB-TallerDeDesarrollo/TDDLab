import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";

interface ContentStateProps {
  description?: string;
  title: string;
  variant: "loading" | "empty" | "error";
}

const StateContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  minHeight: 220,
  border: "0.5px solid #898989",
  borderRadius: 5,
  padding: theme.spacing(4),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(1.5),
  textAlign: "center",
  backgroundColor: "#FFFFFF",
}));

const StateTitle = styled(Typography)(({ theme }) => ({
  color: "#002346",
  fontSize: 22,
  fontWeight: 700,
  lineHeight: "28px",
  [theme.breakpoints.down("sm")]: {
    fontSize: 18,
  },
}));

const StateDescription = styled(Typography)({
  maxWidth: 460,
  color: "#4A4A4A",
  fontSize: 15,
  fontWeight: 400,
  lineHeight: "22px",
});

function ContentState({
  description,
  title,
  variant,
}: Readonly<ContentStateProps>) {
  return (
    <StateContainer>
      {variant === "loading" ? <CircularProgress /> : null}
      <StateTitle>{title}</StateTitle>
      {description ? <StateDescription>{description}</StateDescription> : null}
    </StateContainer>
  );
}

export default ContentState;
