import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import jsdoc from "eslint-plugin-jsdoc";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist", "coverage"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Ban the `any` type entirely — use `unknown` and narrow instead.
      "@typescript-eslint/no-explicit-any": "error",
      // Ban the `object` type — use a specific type or `Record<string, unknown>`.
      "@typescript-eslint/no-restricted-types": [
        "error",
        {
          types: {
            object: {
              message: "Avoid the `object` type. Use a specific interface or Record<string, unknown> instead.",
              fixWith: "Record<string, unknown>",
            },
          },
        },
      ],
    },
  },
  {
    files: ["**/src/lib/financial-types.ts"],
    plugins: {
      jsdoc,
    },
    rules: {
      // Require a JSDoc block on every interface and type alias.
      "jsdoc/require-jsdoc": [
        "error",
        {
          require: {
            ClassDeclaration: true,
            ClassExpression: true,
            FunctionDeclaration: false,
            FunctionExpression: false,
            MethodDefinition: false,
            ArrowFunctionExpression: false,
          },
          contexts: ["TSInterfaceDeclaration", "TSTypeAliasDeclaration"],
          checkConstructors: false,
          enableFixer: false,
        },
      ],
      // Require a JSDoc `@param` entry for every named parameter.
      "jsdoc/require-param": "error",
    },
  },
]);
