import { createTheme } from '@mui/material/styles';

const tddTheme = createTheme({
  palette: {
    primary: {
      main: '#3B54A3',
    },
    secondary: {
      main: '#6ABB46',
    },
    success: {
      main: '#6ABB46',
    },
    error: {
      main: '#ED232A',
    },
  },
  typography: {
    fontFamily: '"Afacad", "Roboto", "Helvetica", "Arial", sans-serif',
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
  },
});

export default tddTheme;
