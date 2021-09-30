'use strict'

const webpack = require('webpack')
const path = require('path')
const buildPath = path.join(__dirname, './dist')
const args = require('yargs').argv

const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const postcssPresetEnv = require('postcss-preset-env')
const cssnano = require('cssnano')

const isProd = args.prod
const isDev = args.dev
const env = args.envFile
if (env) {
  // Load env file
  require('dotenv').config({ path: env })
}

const main = ['./src/site.js']
const common = ['./src/common.js']
let devtool

if (isDev) {
  main.push('webpack-dev-server/client?http://0.0.0.0:8080')
  devtool = 'source-map'
}

const plugins = [
  new MiniCssExtractPlugin({ filename: '[name].[hash].css' }),
  new HtmlWebpackPlugin({
    template: './src/index.html',
    chunks: ['main'],
    inject: 'body'
  }),
  new HtmlWebpackPlugin({
    template: './src/error.html',
    chunks: ['common'],
    inject: 'body',
    filename: 'error.html'
  }),
  new webpack.DefinePlugin({
    'process.env.CLIENT_ID': JSON.stringify(process.env.CLIENT_ID),
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    'process.env.ENABLE_GOOGLE_AUTH': JSON.stringify(process.env.ENABLE_GOOGLE_AUTH),
    'process.env.GTM_ID': JSON.stringify(process.env.GTM_ID)
  })
]

if (isProd) {
  plugins.push(
    new webpack.NoEmitOnErrorsPlugin()
  )
}

module.exports = {
  entry: {
    main: main,
    common: common
  },
  node: {
    global: false,
    __filename: false,
    __dirname: false,
  },

  output: {
    path: buildPath,
    publicPath: 'auto', //'/webapps/TechRadar/',
    filename: '[name].[hash].js',
    assetModuleFilename: 'assets/[name][ext]'
  },

  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, use: [{ loader: 'babel-loader' }] },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: ['style-loader', 
        {
          loader: MiniCssExtractPlugin.loader, 
          options: {
            esModule: false,
          } 
        }, 
        {
          loader: 'css-loader',
          options: { importLoaders: 1, url: true, sourceMap: true }
        },
        {
          loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  postcssPresetEnv({ browsers: 'last 2 versions' }),
                  cssnano({ preset: ['default', { discardComments: { removeAll: true } }] }) 
                ]
              },
              sourceMap: true
            }
        }//,
        // {
        //   loader: "resolve-url-loader", //resolve-url-loader needs to come *BEFORE* sass-loader
        //   options: {
        //     sourceMap: true,
        //     //root: ''
        //   }
        // }
        , 'sass-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|ico)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.html$/i,
        loader: "html-loader",
      },
      // {
      //   test: /\.(eot|svg|ttf|woff|woff2)$/,
      //   use: [{ loader: 'file-loader', options: { name: "images/[name].[ext]" } }]
      // },
      // {
      //   test: /\.(png|jpg|ico)$/,
      //   exclude: /node_modules/,
      //   use: [{ loader: 'file-loader', options: { name: "images/[name].[ext]" , context: "./src/images" } }]
      // },
      {
        test: require.resolve('jquery'),
        use: [{ loader: 'expose-loader', options: { exposes: ["$", "jQuery" ] } }]
      }
    ]
  },

  plugins: plugins,

  devtool: devtool,

  devServer: {
    static: buildPath,
    host: '0.0.0.0',
    port: 8080
  }
}
