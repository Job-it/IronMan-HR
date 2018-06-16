const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
var SRC_DIR = path.join(__dirname, '/client/src');
var DIST_DIR = path.join(__dirname, '/client/dist');

module.exports = {
  entry: {
    app: `${SRC_DIR}/index.jsx`
  },
  plugins: [
      new CleanWebpackPlugin(['dist']),    
      new MiniCssExtractPlugin({
        filename: "[name].css",
        chunkFilename: "[id].css"
      })
    ],
    output: {
      filename: 'bundle.js',
      path: DIST_DIR
    }, 
    module : {
      rules : [
        {
          test : /\.jsx?/,
          include : SRC_DIR,
          loader : 'babel-loader',      
          query: {
            presets: ['react', 'es2015']
          }
        }
      ]
  }
};