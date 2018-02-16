var webpack = require('webpack');
var path = require('path');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    context: __dirname,
    entry: ['./demo/demo.js'],
    output: {
        path: __dirname + '/dist',
        filename: 'demo-bundle.js'
    },
    eslint: {
        configFile: '.eslintrc.json'
    },
    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'eslint-loader',
            exclude: /node_modules/
        }, {
            test: /\.(jpe?g|png|gif)$/i,
            loader: 'file-loader',
            query: {
                name: '[name].[ext]',
                outputPath: 'images/'
            },
        }, {
            test: /node_modules\/jquery-ui\/.*\.css$/,
            loaders: ['style-loader','css-loader']
        }],
    },
    plugins: [
        new CopyWebpackPlugin([{
            from: 'node_modules/openseadragon/build/openseadragon/images',
            to: 'images'
        }, {
            from: 'demo/images',
            to: 'images'
        }, {
            from: 'demo/static',
            to: 'static'
        }]),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
            'window.$': 'jquery',
        })
    ]
};
