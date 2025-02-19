const path = require("path");

module.exports = {
  reactStrictMode: true,
  transpilePackages: ["@tournament-app/types"],
  output: "standalone",
  experimental: {
    outputFileTracingRoot: path.join(__dirname, "../../"),
  },
};
