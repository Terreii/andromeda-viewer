'use strict'

var path = require('path')

var cwd = process.cwd()

module.exports = {
  entry: path.join(cwd, 'main.js'),
  output: {
    filename: path.join(cwd, 'builds', 'bundle.js')
  },
  module: {
    loaders: [
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.css$/,
        loader: 'style!css?modules'
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: [
            'latest',
            'react'
          ]
        }
      },
      {
        test: /master_message_template\.msg/,
        loader: path.join(cwd, 'tools', 'createMessageTemplate.js')
      }
    ]
  }
}
