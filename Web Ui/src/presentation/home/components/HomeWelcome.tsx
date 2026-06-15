import { styled } from "@mui/material/styles";

const WelcomeTitle = styled("h1")(({ theme }) => ({
  color: "#000000",
  fontFamily: '"Palanquin Dark", "Inter", sans-serif',
  fontWeight: 600,
  fontSize: 32,
  lineHeight: "58px",
  letterSpacing: 0.2,
  marginLeft: theme.spacing(11.625),
  marginTop: 0,
  marginBottom: 0,
  [theme.breakpoints.down("lg")]: {
    marginLeft: 0,
  },
  [theme.breakpoints.down("sm")]: {
    fontSize: 26,
    lineHeight: "38px",
  },
}));

interface HomeWelcomeProps {
  greeting: string;
}

function HomeWelcome({ greeting }: Readonly<HomeWelcomeProps>) {
  return <WelcomeTitle>{greeting}</WelcomeTitle>;
}

export default HomeWelcome;
