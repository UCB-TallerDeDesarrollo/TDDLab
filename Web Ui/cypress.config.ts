import { defineConfig } from "cypress";

export default defineConfig({
	video: false,
	e2e: {
		baseUrl: "http://localhost:5173",
		specPattern: "test/cypress/e2e/**/*.spec.{js,jsx,ts,tsx}",
		screenshotOnRunFailure: false,
		video: false,
		viewportWidth: 1920,
		viewportHeight: 1080,
		supportFile: "test/cypress/support/e2e.ts",
	},
});