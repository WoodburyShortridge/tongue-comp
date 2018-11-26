const path = require('path');
module.exports = {
  mode: 'development',
  entry: ["@babel/polyfill", './main.js'],
  output: {
    path: path.resolve(__dirname, "./"),
    filename: 'bundle.js'
  },
  module: {
    rules: [
    {
      test: /\.css$/,
      use: [
        { loader: "style-loader" },
        { loader: "css-loader" }
      ]
    },{
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['env']
        }
      }
    }]
  }
};
