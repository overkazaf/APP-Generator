var webpack = require('webpack');
var path = require('path');
var defaultSettings = require('./defaults');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var filePath = defaultSettings.filePath;
var precss = require('precss');
var autoprefixer = require('autoprefixer');

var webpackConfig = {
  entry: {},
  output: {
    path: filePath.devbuild,
    filename: '[name].js',
    publicPath: filePath.publicPath
  },
  cache: true,
  devtool: 'inline-source-map',
  resolve: {
    extensions: ['', '.js', '.jsx'],
    alias: {
      'components': path.join(__dirname, '../src/javascript/components'),
      'extend': path.join(__dirname, '../src/javascript/extend'),
      'constants': path.join(__dirname, '../src/javascript/extend/constants'),
      'page': path.join(__dirname, '../src/javascript/page'),
      'scss': path.join(__dirname, '../src/scss'),
      'states': path.join(__dirname, '../src/javascript/states'),
      'pages': path.join(__dirname, '../src/${project}Pages'),
      'images': path.join(__dirname, '../res/images'),
      'data': path.join(__dirname, '../src/javascript/data'),
      'font': path.join(__dirname, '../res/font'),
      'jquery': path.join(__dirname, '../node_modules/jquery/dist/jquery.min.js')
    }
  },
  module: {
    noParse: [
      path.join(__dirname, '../node_modules/jquery/dist/jquery.min.js')
    ],
    loaders: [
      {
        test: /.jsx?$/,
        loaders: ['react-hot', 'babel-loader?presets[]=es2015&presets[]=react&presets[]=stage-0&presets[]=stage-1', 'webpack-module-hot-accept'],
        exclude: /node_modules/
      },
      {
        test: /\.scss/,
        loader: 'style!css!postcss!sass?outputStyle=compressed',
      },
      {
        test: /\.css$/,
        loader: 'style!css!postcss',
      },
      {
        test: /\.(png|jpg|gif|woff|woff2|eot|ttf|svg)$/,
        loader: 'url-loader?limit=1&name=res/[name].[hash:8].[ext]'
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  },
  postcss:function(){
    return [precss, autoprefixer];
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new ExtractTextPlugin('[name].css'),
    new webpack.NoErrorsPlugin(),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery"
    })
  ]
};

function injectEntry() {
  defaultSettings.pagesToPath().forEach(function (item) {
    webpackConfig.entry[item.name] = [
      'webpack-dev-server/client?http://${localIPAddress}:' + defaultSettings.port,
      'webpack/hot/only-dev-server',
      item.entry
    ];
  });
}

function injectHtmlWebpack() {
  defaultSettings.pagesToPath().forEach(function (item) {
    webpackConfig.plugins.push(
      new HtmlWebpackPlugin({
        filename: item.ftl,
        template: item.templates,
        chunks: [item.name],
        inject: true
      })
    );
  });
}

(function () {
  injectEntry();
  injectHtmlWebpack();
})();

module.exports = webpackConfig;