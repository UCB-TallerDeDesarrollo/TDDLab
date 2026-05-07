export default {
  preset: "ts-jest",
  testEnvironment: "jest-environment-jsdom",
  testPathIgnorePatterns: ["<rootDir>/test/cypress/"],
  transform: {
    // Hemos cambiado "ts-jest" por un array con opciones:
    "^.+\\.tsx?$": ["ts-jest", {
      isolatedModules: true, // Ejecuta cada archivo por separado sin validar tipos globales
      diagnostics: false,    // Desactiva los reportes de error de TypeScript en los tests
    }],
  },
  moduleNameMapper: {
    "\\.(gif|ttf|eot|svg|png)$": "<rootDir>/test/__ mocks __/fileMock.js",
    "^.+\\.(css|less)$": "<rootDir>/CSSStub.js",
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
  silent: true,
};