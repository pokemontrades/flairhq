const HtmlPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    entry: './assets/index.js'
  },
  output: {
    path: __dirname + '/.tmp/public',
    filename: 'bundle.js'
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
      { test: /\.(png|svg|jpg|gif)$/, loader: 'file-loader' }
    ]
  },

  plugins: [
    new HtmlPlugin({
      template: './assets/index.html'
    }),
    new CopyPlugin([
      { from: './assets/favicon.ico' },
      { from: './assets/manifest.json' },
    ])
  ]
};