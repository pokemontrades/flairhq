const HtmlPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const precss = require('precss');
const autoprefixer = require('autoprefixer');

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
      { test: /\.(png|svg|jpg|gif)$/, loader: 'file-loader' },
      {
        test: /\.scss$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          {
            loader: 'postcss-loader',
            options: {
              plugins() {
                return [
                  precss,
                  autoprefixer,
                ];
              },
            },
          },
          { loader: 'sass-loader' },
        ],
      }
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