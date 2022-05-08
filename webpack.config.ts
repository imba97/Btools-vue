import webpack from 'webpack'

const { resolve } = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WriteJsonWebpackPlugin = require('write-json-webpack-plugin')
const ExtensionReloader = require('webpack-extension-reloader')

const isProduction = process.env.NODE_ENV === 'production'

require('@babel/core').transform('code', {
  plugins: ['@babel/plugin-transform-runtime']
})

module.exports = (): webpack.Configuration => {
  let manifestJSON = require('./src/manifest.json')

  // 版本号
  manifestJSON.version = '2.1.0'

  let configs: webpack.Configuration = {
    node: false,
    mode: isProduction ? 'production' : 'development', // development production
    entry: {
      btools: './src/btools.ts',
      background: './src/background/background.ts',
      popup: './src/popup/popup.ts',
      options: './src/options/options.ts'
    },
    output: {
      path: resolve('Build'),
      filename: '[name].js'
    },
    resolve: {
      extensions: ['.js', '.ts', '.vue', '.scss', '.json'],
      alias: {
        vue$: 'vue/dist/vue.esm.js',
        '@': resolve('src'),
        '@styles': resolve('src/assets/styles')
      }
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          exclude: /mode_modules/,
          loader: 'vue-loader'
        },

        {
          test: /\.tsx?$/,
          exclude: /mode_modules/,
          use: [
            'babel-loader',
            {
              loader: 'ts-loader',
              options: {
                appendTsSuffixTo: [/\.vue$/],
                appendTsxSuffixTo: [/\.vue$/],
                transpileOnly: true,
                happyPackMode: false
              }
            }
          ]
        },

        {
          test: /\.(sa|sc|c)ss$/,
          exclude: /mode_modules/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'postcss-loader',
            'sass-loader'
          ]
        },

        {
          test: /\.(jpg|jpeg|png|gif|svg|webp)$/,
          exclude: /mode_modules/,
          loader: 'url-loader',
          options: {
            limit: 8 * 1024
          }
        },

        {
          exclude:
            /\.(mode_modules|vue|js|tsx?|scss|html|jpg|jpeg|png|gif|svg|webp)/,
          loader: 'file-loader',
          options: {
            outputPath: 'media'
          }
        }
      ]
    },

    plugins: [
      new HtmlWebpackPlugin({
        filename: 'popup.html',
        template: './src/popup/popup.html',
        minify: {
          collapseWhitespace: isProduction,
          removeComments: isProduction
        },
        chunks: ['popup']
      }),
      new HtmlWebpackPlugin({
        filename: 'options.html',
        template: './src/options/options.html',
        minify: {
          collapseWhitespace: isProduction,
          removeComments: isProduction
        },
        chunks: ['options']
      }),
      new HtmlWebpackPlugin({
        filename: 'background.html',
        template: './src/background/background.html',
        minify: {
          collapseWhitespace: isProduction,
          removeComments: isProduction
        },
        chunks: ['background']
      }),
      new MiniCssExtractPlugin({
        filename: '[name].css'
      }),
      new VueLoaderPlugin(),
      new CopyWebpackPlugin([
        {
          from: resolve('src/assets/icon'),
          to: resolve('Build/icon'),
          toType: 'dir'
        },
        {
          from: resolve('src/_locales'),
          to: resolve('Build/_locales'),
          toType: 'dir'
        }
      ]),
      manifestJSON &&
        new WriteJsonWebpackPlugin({
          pretty: false,
          object: manifestJSON,
          path: '/',
          filename: 'manifest.json'
        })
    ]
  }

  if (isProduction) {
    configs.plugins!.unshift(new CleanWebpackPlugin())
  }

  if (!isProduction && process.env.BROWSER_ENV === 'chrome') {
    configs.plugins!.push(
      new ExtensionReloader({
        reloadPage: true,
        entries: {
          // The entries used for the content/background scripts or extension pages
          contentScript: 'btools',
          background: 'background',
          extensionPage: ['popup', 'options']
        }
      })
    )
  }

  return configs
}
