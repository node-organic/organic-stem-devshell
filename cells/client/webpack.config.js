const HtmlWebpackPlugin = require('html-webpack-plugin')
const webcell = require('webpack-organic-webcell-configurator')
const path = require('path')

// css
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const postcssImport = require('postcss-import')
const postcssReporter = require('postcss-reporter')
const postcssCssnext = require('postcss-cssnext')

const globalModules = ['node_modules'].map((v) => {
  return path.join(path.resolve(__dirname, '../'), v)
})
const localModules = ['web_modules', 'node_modules', 'lib'].map((v) => {
  return path.join(__dirname, v)
})

module.exports = webcell({
  dnaLoader: require('lib/load-root-dna'),
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
      new HtmlWebpackPlugin({
        template: 'index.html',
        favicon: 'favicon.png'
      }),
      new MiniCssExtractPlugin({
        filename: '[name].css',
        chunkFilename: '[id].css'
      })
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
                  postcssReporter(),
                  postcssCssnext()
                ]
              }
            }
          ]
        },
        {
          test: /\.tag$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              plugins: [ require.resolve('@babel/plugin-transform-react-jsx') ]
            }
          }
        },
        {
          test: /\.tag$/,
          exclude: /node_modules/,
          use: [
            { loader: require.resolve('organic-oval/webpack/oval-loader') }
          ]
        }
      ]
    }
  }
})
