var webpack = require('webpack');
var path = require('path');
var defaultSettings = require('./defaults');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var precss = require('precss');
var autoprefixer = require('autoprefixer');
var filePath = defaultSettings.filePath;
var pagePaths = defaultSettings.pagesToPath();
var curIndex = 0;
var curPage = pagePaths[curIndex];

var webpackConfig = {
  entry: {
    app: curPage.entry,
    vendors: ['react', 'react-dom', 'jquery', 'babel-polyfill']
  },
  output: {
    path: filePath.package,
    filename: 'js/[name].js',
    publicPath: filePath.publicPath
  },
  devtool: false,
  cache: false,
  resolve: {
    extensions: ['', '.js', '.jsx'],
    alias: {
      'components': path.join(__dirname, '../src/javascript/components'),
      'page': path.join(__dirname, '../src/javascript/page'),
      'extend': path.join(__dirname, '../src/javascript/extend'),
      'constants': path.join(__dirname, '../src/javascript/extend/constants'),
      'scss': path.join(__dirname, '../src/scss'),
      'states': path.join(__dirname, '../src/javascript/states'),
      'pages': path.join(__dirname, '../src/pages'),
      'images': path.join(__dirname, '../res/images'),
      'data': path.join(__dirname, '../src/javascript/data'),
      'fonts': path.join(__dirname, '../res/fonts'),
      'jquery': path.join(__dirname, '../node_modules/jquery/dist/jquery.min.js')
    }
  },
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader?presets[]=es2015&presets[]=react&presets[]=stage-0&presets[]=stage-1',
        exclude: /node_modules/
      },
      {
        test: /\.scss/,
        loader: ExtractTextPlugin.extract('css!postcss!sass?outputStyle=compressed')
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style', 'css!postcss'),
      },
      {
        test: /\.(png|jpg|gif)$/,
        loader: 'url-loader?limit=1&name=img/[name].[ext]'
      },
      {
        test: /\.(woff|woff2|eot|ttf|svg)$/,
        loader: 'url-loader?limit=1&name=font/[name].[ext]'
      }
    ]
  },
  postcss:function(){
    return [precss, autoprefixer];
  },
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.DefinePlugin({
      'process.env':{
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.CommonsChunkPlugin('vendors', 'js/core.js'),
    new ExtractTextPlugin('css/[name].css'),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: curPage.templates,
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: false
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: false,
      compress: {
        warnings: false
      },
      mangle: {
        except: ['$super', '$', 'exports', 'require']
      },
      output: {
        comments: false
      }
    }),
    new webpack.NoErrorsPlugin(),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery"
    })
  ]
};

module.exports = webpackConfig;