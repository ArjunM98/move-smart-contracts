var path = require('path');
var WrapperPlugin = require('wrapper-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: './src/visualizers/panels/WebGMEReactViz/src/index.jsx',
    output: {
        filename: 'reactViz.bundle.js',
        path: path.join(__dirname, './src/visualizers/panels/WebGMEReactViz/')
    },
    plugins: [
        new WrapperPlugin({
            test: /\.js$/,
            header: 'define([], function () {\nreturn function (VISUALIZER_INSTANCE_ID) {',
            footer: '};\n});'
        }),
        new ExtractTextPlugin('reactViz.bundle.css')
    ],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: [
                    'babel-loader',
                ],
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({
                    use: 'css-loader',
                }),
            }
        ],
    },
    resolve: {
        extensions: ['.js', '.jsx'],
    },
};