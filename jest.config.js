const { createDefaultPreset } = require("ts-jest");

const defaultPreset = createDefaultPreset();

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...defaultPreset.transform,
  },
  testMatch: ["**/src/tests/**/*.test.ts"],
};
