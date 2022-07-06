const common = require("./webpack.common.config");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = {
  ...common,
  mode: "production",
  devtool: "source-map",
  module: {
    rules: [
      ...common.module.rules.filter((rule) => rule.use.includes === undefined || !rule.use.includes("css-loader")),
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  output: {
    ...common.output,
    clean: true,
  },
  optimization: {
    usedExports: true,
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        redux: {
          test: /[\\/]node_modules[\\/](redux|@reduxjs)/,
          name: "redux",
          reuseExistingChunk: true,
        },
        forms: {
          test: /[\\/]node_modules[\\/](formik|yup)/,
          name: "forms",
          reuseExistingChunk: true,
        },
        // this needs to be near the bottom since there are multiple packages that start with react
        react: {
          test: /[\\/]node_modules[\\/]react/,
          name: "react",
          reuseExistingChunk: true,
        },
        // this is the catch all for everything else
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor",
          reuseExistingChunk: true,
        },
      },
    },
    minimizer: [`...`, new CssMinimizerPlugin()],
  },
  plugins: [...common.plugins, new MiniCssExtractPlugin()],
};
