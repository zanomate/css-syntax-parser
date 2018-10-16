/* global __dirname, require, module*/

const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'css-syntax-parser.js',
        libraryTarget: 'umd',
        library: 'css-syntax-parser',
        umdNamedDefine: true,
        globalObject: 'typeof self !== \'undefined\' ? self : this'
    },
    resolve: {
        extensions: ['.ts']
    },
    plugins: [
        new CopyPlugin([
            './build',
            './README.md'
        ])
    ],
    module: {
        rules: [{
            test: /\.ts$/,
            loader: 'ts-loader'
        }]
    }
};
