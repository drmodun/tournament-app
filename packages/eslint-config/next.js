const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "eslint:recommended",
    "prettier",
    require.resolve("@vercel/style-guide/eslint/next"),
    "turbo",
  ],
  globals: {
    React: true,
    JSX: true,
  },
  env: {
    node: true,
  },
  plugins: ["only-warn"],
  settings: {
    "import/resolver": {
      typescript: {
        project,
      },
    },
  },
  ignorePatterns: [
    // Ignore dotfiles
    ".*.js",
    "node_modules/",
  ],
  overrides: [
    { files: ["*.js?(x)", "*.ts?(x)"] },
    {
      files: ["*.ts", "*.tsx"],
      plugins: ["@typescript-eslint"],
      rules: {
        "no-undef": "off",
        // The base rule crashes on some TypeScript syntax; use the TS-aware one.
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": "warn",
        // Images come from user uploads on arbitrary hosts, so plain <img> is intentional.
        "@next/next/no-img-element": "off",
      },
    },
  ],
};
