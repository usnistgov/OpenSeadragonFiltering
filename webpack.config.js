var webpack = require('webpack');
var path = require('path');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: "development",
    context: __dirname,
    entry: ['./demo/demo.js'],
    output: {
        filename: 'demo-bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath:'dist/'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                enforce: "pre",
                loader: 'eslint-loader',
                exclude: /node_modules/,
                options: {
                    configFile: '.eslintrc.json'
                }
            },
            {
                test: /\.(jpe?g|png|gif)$/i,
                loader: 'file-loader',
                query: {
                    name: '[name].[ext]',
                    outputPath: 'images/'
                },
            },
            {
				test: /\.css$/,
                include: /node_modules/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    resolve: {
        // options for resolving module requests
        // (does not apply to resolving to loaders)
        modules: [
            "node_modules",
            path.join(__dirname, "demo")
        ],
        // directories where to look for modules
        extensions: [".js", ".json", ".jsx", ".css"]
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
        }, {
            from: 'demo/*'
        }
        ]),
        new webpack.LoaderOptionsPlugin({
            test: /\.js$/,
            context: __dirname,
            debug: true,
            options: {
                eslint: {
                    configFile: '.eslintrc.json'
                }
            }
        }),
        new webpack.ProvidePlugin(
            {
                $: 'jquery',
                jQuery: 'jquery',
                'window.jQuery': 'jquery',
                'window.$': 'jquery'
            }
        )
    ]
};
