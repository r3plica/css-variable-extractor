module.exports = {
  preset: "jest-preset-angular",
  setupFilesAfterEnv: ["<rootDir>/src/setup-jest.ts"],
  transformIgnorePatterns: ["node_modules/(?!@angular|@ngrx|jsonpath-plus)"],
  transform: {
    "^.+\\.(ts|js|mjs|html|svg)$": [
      "jest-preset-angular",
      {
        tsconfig: "<rootDir>/tsconfig.spec.json",
        stringifyContentPathRegex: "\\.(html|svg)$",
      },
    ],
  },
  moduleFileExtensions: ["ts", "html", "js", "json", "mjs"],
  moduleNameMapper: {
    "^@services(.*)$": "<rootDir>/src/app/_core/services$1",
    "^@models(.*)$": "<rootDir>/src/app/_core/models$1",
    "^@store(.*)$": "<rootDir>/src/app/_core/store$1",
    "^@directives(.*)$": "<rootDir>/src/app/_core/directives$1",
    "^@components(.*)$": "<rootDir>/src/app/_core/components$1",
  },
  collectCoverage: true,
  coverageDirectory: "<rootDir>/coverage",
  coverageReporters: ["html", "lcov", "text-summary"],
};
