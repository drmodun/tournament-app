const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const nextPlugin = require("@next/eslint-plugin-next");
const turbo = require("eslint-config-turbo/flat").default;
const prettier = require("eslint-config-prettier");
const globals = require("globals");

/**
 * Shared flat config for the Next.js app.
 * @type {import("eslint").Linter.Config[]}
 */
module.exports = [
  {
    ignores: [".next/**", "node_modules/**", "storybook-static/**", "next-env.d.ts"],
  },
  js.configs.recommended,
  nextPlugin.flatConfig.recommended,
  ...turbo,
  prettier,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        React: true,
        JSX: true,
      },
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      // TypeScript checks these itself
      "no-undef": "off",
      // The base rule crashes on some TypeScript syntax; use the TS-aware one.
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "error",
      // Images come from user uploads on arbitrary hosts, so plain <img> is intentional.
      "@next/next/no-img-element": "off",
    },
  },
];
