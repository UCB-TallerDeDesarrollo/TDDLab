import { createTheme } from "@mui/material/styles";
import { fontFamilies, typographyVariants } from "../styles/typography";

export const appTheme = createTheme({
  typography: {
    fontFamily: fontFamilies.primary,
    h1: typographyVariants.h1,
    h2: typographyVariants.h2,
    h3: typographyVariants.h3,
    h4: typographyVariants.h4,
    h5: typographyVariants.h5,
    body1: typographyVariants.paragraphBig,
    body2: typographyVariants.paragraphMedium,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: fontFamilies.primary,
        },
        h1: typographyVariants.h1,
        h2: typographyVariants.h2,
        h3: typographyVariants.h3,
        h4: typographyVariants.h4,
        h5: typographyVariants.h5,
        ".font-mono": {
          fontFamily: fontFamilies.mono,
        },
      },
    },
  },
});
