import nextConfig from "@repo/eslint-config/next.js";
import storybook from "eslint-plugin-storybook";

/** @type {import("eslint").Linter.Config[]} */
export default [...nextConfig, ...storybook.configs["flat/recommended"]];
