const path = require('path');
const slsw = require('serverless-webpack');

module.exports = {
  target: 'node',
  mode: 'development',
  entry: slsw.lib.entries,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.ts', '.js', '.jsx', '.json' ]
  },
  output: {
    filename: `[name].js`,
    path: path.join(__dirname, 'build', 'bundle'),
    libraryTarget: 'commonjs'
  },
};
