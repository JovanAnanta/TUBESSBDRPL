import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const tsJest = require("ts-jest");
const { createDefaultPreset } = tsJest;

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'backend/controller/**/*.ts',
    'backend/service/**/*.ts'
  ],
  testMatch: ['**/backend/unitTest/**/*.test.ts'],
  verbose: true,
  transform: {
    ...tsJestTransformCfg,
  },
  rootDir: './',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};

export default config;