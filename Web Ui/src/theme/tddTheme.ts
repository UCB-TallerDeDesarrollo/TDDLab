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
		MuiButton: {
			styleOverrides: {
				root: {
					transition: "all 0.175s ease-out",
					"&:hover": {
						filter: "brightness(0.9)",
						boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
					},
					"&:active": {
						transform: "scale(0.97)",
					},
				},
			},
		},
		MuiSwitch: {
			styleOverrides: {
				switchBase: {
					"&.Mui-checked": {
						color: "#3B54A3",
						"& + .MuiSwitch-track": {
							backgroundColor: "#3B54A3",
						},
					},
				},
			},
		},
	},
});

export default tddTheme;
