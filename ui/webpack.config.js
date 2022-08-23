const common = require("./webpack.common.config");
const path = require("path");

module.exports = {
  ...common,
  mode: "development",
  devtool: "source-map",
  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
    },
    devMiddleware: {
      index: true,
      publicPath: "/mock-server/admin",
    },
    compress: true,
    port: 8080,
    historyApiFallback: true,
  },
};
