/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^@darkhorseone/x402-core$': '<rootDir>/node_modules/@darkhorseone/x402-core/src',
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/types/**/*.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.jest.json',
        useESM: false,
      },
    ],
  },
  transformIgnorePatterns: ['/node_modules/(?!@darkhorseone/x402-core)'],
};
