'use strict'

var path = require('path')

var cwd = process.cwd()

module.exports = {
  entry: path.join(cwd, 'main.js'),
  output: {
    filename: 'app.js',
    path: path.join(cwd, 'public')
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              modules: true
            }
          }
        ]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /master_message_template\.msg/,
        loader: path.join(cwd, 'tools', 'createMessageTemplate.js')
      }
    ]
  }
}
