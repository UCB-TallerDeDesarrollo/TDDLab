import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#002345",
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1200,
      xl: 1536,
    },
  },
  typography: {
    fontFamily: "'Afacad', sans-serif",
    htmlFontSize: 16,
    fontSize: 16,  
    h1: { fontSize: "60px", fontWeight: 700 },
    h2: { fontSize: "45px", fontWeight: 700 },
    h3: { fontSize: "28px", fontWeight: 700 },
    h4: { fontSize: "24px", fontWeight: 800 },
    h5: { fontSize: "18px", fontWeight: 800 },
    h6: { fontSize: "13px", fontWeight: 800 },
    body1: { fontSize: "18px", fontWeight: 500 },
    body2: { fontSize: "16px", fontWeight: 500 },
    caption: { fontSize: "14px", fontWeight: 500 },
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: "15px",
          fontWeight: 500,
          textTransform: "none",
        },
      },
    },
    MuiTypography: {
      defaultProps: {
        variantMapping: {
          body1: "p",
          body2: "p",
          caption: "p",
        },
      },
    },
  },
});

export default theme;