// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Buscar tests en src/
  roots: ['<rootDir>/src'],
  
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/**/index.ts'
  ],
  
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  testPathIgnorePatterns: [
    '/node_modules/',
    '/out/',
    '/dist/',
    '/src/test/' 
  ],
  
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        module: 'commonjs',
        esModuleInterop: true,
        types: ['node', 'jest']
      }
    }]
  },
  
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  testTimeout: 10000,
  verbose: true,
  clearMocks: true,
  restoreMocks: true
};