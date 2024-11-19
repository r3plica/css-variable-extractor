module.exports = {
  preset: "jest-preset-angular",
  setupFilesAfterEnv: ["<rootDir>/src/setup.jest.ts"],
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
    "@services/(.*)": "<rootDir>/src/app/core/services/$1",
    "@store/(.*)": "<rootDir>/src/app/core/store/$1",
    "@components/(.*)": "<rootDir>/src/app/core/components/$1",
  },
};
