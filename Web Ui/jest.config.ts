export default {
  preset: "ts-jest",
  testEnvironment: "jest-environment-jsdom",
  testPathIgnorePatterns: ["<rootDir>/test/cypress/"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
    // process `*.tsx` files with `ts-jest`
  },
  moduleNameMapper: {
    "\\.(gif|ttf|eot|svg|png)$": "<rootDir>/test/__ mocks __/fileMock.js",
    "^.+\\.(css|less)$": "<rootDir>/CSSStub.js",
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
  silent: true,
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/main.tsx",
    "!src/vite-env.d.ts",
    "!src/firebaseConfig.tsx",
  ],
};
