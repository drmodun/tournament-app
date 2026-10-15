const path = require("path");

module.exports = {
  reactStrictMode: true,
  transpilePackages: ["@tournament-app/types"],
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../../"),
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
};
