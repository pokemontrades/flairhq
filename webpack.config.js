const HtmlPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    entry: './ui/index.js'
  },
  output: {
    path: __dirname + '/.tmp/public',
    filename: 'bundle.js',
    publicPath: "/"
  },
  devServer: {
    historyApiFallback: true,
    proxy: {
      '/api': 'http://localhost:1337',
      '/logout': 'http://localhost:1337'
    }
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
      { test: /\.css$/i, use: ['style-loader', 'css-loader'] },
      { test: /\.(png|svg|jpg|gif)$/, loader: 'file-loader' }
    ]
  },

  plugins: [
    new HtmlPlugin({
      template: './ui/index.html'
    }),
    new CopyPlugin([
      { from: './ui/favicon.ico' },
      { from: './ui/manifest.json' },
    ])
  ]
};