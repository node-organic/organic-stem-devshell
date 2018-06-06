const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const webcell = require('webpack-organic-webcell-configurator')
const path = require('path')

// css
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const postcssImport = require('postcss-import')
// const stylelint = require('stylelint')
const postcssReporter = require('postcss-reporter')
const postcssCssnext = require('postcss-cssnext')

const globalModules = ['web_modules', 'node_modules', 'lib/client'].map((v) => {
  return path.join(path.resolve(__dirname, '../../'), v)
})
const localModules = ['web_modules', 'node_modules'].map((v) => {
  return path.join(__dirname, v)
})

module.exports = webcell({
  dnaSourcePaths: [
    path.resolve(__dirname, '../../dna')
  ],
  selectBranch: 'cells.client'
}, function (dna) {
  return {
    entry: './index.js',
    mode: 'development',
    output: {
      publicPath: dna.cells['client'].mountPoint || '/'
    },
    devServer: {
      contentBase: path.resolve(__dirname, './dist'),
      port: dna['cell-ports']['client']
    },
    'resolve': {
      'extensions': ['.webpack.js', '.web.js', '.tag', '.js'],
      'modules': globalModules.concat(localModules).concat(['node_modules'])
    },
    'plugins': [
      new HtmlWebpackPlugin({ template: 'index.html' }),
      new MiniCssExtractPlugin({
        filename: '[name].css',
        chunkFilename: '[id].css'
      }),
      new CopyWebpackPlugin([
        {
          from: 'node_modules/@webcomponents/webcomponentsjs/webcomponents-bundle.js',
          to: 'webcomponents-bundle.js',
          toType: 'file'
        },
      ])
    ],
    'module': {
      'rules': [
        {
          test: /\.(eot|svg|ttf|woff|woff2)$/,
          use: 'file-loader?name=material-design-icons/iconfont/[name].[ext]'
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            { loader: 'css-loader', options: { importLoaders: 1 } },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: 'inline',
                plugins: () => [
                  postcssImport(),
                  // stylelint(),
                  postcssReporter(),
                  postcssCssnext()
                ]
              }
            }
          ]
        },
        {
          test: /\.tag$/,
          exclude: /node_modules/,
          use: [
            {loader: 'organic-oval/webpack/oval-loader'},
            {loader: 'organic-oval/webpack/oval-control-statements-loader'}
          ]
        }
      ]
    }
  }
})
