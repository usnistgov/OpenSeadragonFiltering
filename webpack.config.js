var webpack = require("webpack");
var path = require("path");
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    context: __dirname,
    entry: ["./demo/demo.js"],
    output: {
        path: __dirname + "/dist",
        filename: "demo-bundle.js"
    },
    eslint: {
        configFile: ".eslintrc.json"
    },
    module: {
        loaders: [{
                test: /\.js$/,
                loader: "eslint-loader",
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        alias: {
            // bind version of jquery-ui
            "jquery-ui": "jquery-ui/jquery-ui.js",
            // bind to modules;
            modules: path.join(__dirname, "node_modules")
        }
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
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery"
        })
    ]
};
