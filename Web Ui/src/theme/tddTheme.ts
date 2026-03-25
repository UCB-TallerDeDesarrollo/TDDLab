import { createTheme } from "@mui/material/styles";
import { fontFamilies, typographyVariants } from "../styles/typography";

const tddTheme = createTheme({
	palette: {
		primary: {
			main: "#3B54A3",
		},
		secondary: {
			main: "#6ABB46",
		},
		success: {
			main: "#6ABB46",
		},
		error: {
			main: "#ED232A",
		},
	},
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

export default tddTheme;
