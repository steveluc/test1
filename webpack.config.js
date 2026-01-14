const path = require('path');

module.exports = {
  entry: './quilt.ts',
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
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'quilt.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devtool: 'source-map',
};
