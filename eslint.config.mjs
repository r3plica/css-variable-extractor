import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import _import from "eslint-plugin-import";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [
      ".angular/",
      ".github/",
      ".vscode/",
      ".vercel/",
      "dist/",
      "node_modules/",
      "**/dist/",
    ],
  },
  ...fixupConfigRules(
    compat.extends(
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:jest/recommended",
      "plugin:import/errors",
      "plugin:import/warnings",
      "plugin:import/typescript",
      "prettier",
    ),
  ),
  {
    plugins: {
      import: fixupPluginRules(_import),
      "unused-imports": unusedImports,
    },

    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node,
        ...globals.browser,
      },

      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: "module",
    },

    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
      },
    },

    rules: {
      "import/order": [
        "error",
        {
          groups: [
            ["builtin", "external"],
            ["internal"],
            ["parent", "sibling", "index"],
          ],
          "newlines-between": "always",
        },
      ],

      "import/no-unresolved": [
        2,
        {
          ignore: ["^@angular/"],
        },
      ],

      "no-undef": ["error"],
      "unused-imports/no-unused-imports": "error",
    },
  },
  {
    files: [
      "**/tailwind.config.js",
      "**/setup-jest.ts",
      "**/*.d.ts",
      "**/index.ts",
    ],

    rules: {
      "unused-imports/no-unused-imports": "off",
    },
  },
];
