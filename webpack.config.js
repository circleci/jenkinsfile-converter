const path = require('path');

const webpack = require('webpack');

module.exports = (env, argv) => {
    return {
        entry: './main.js',
        module: {
            rules: [
                {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    options: {
                        "presets": [
                            {
                                "plugins": [
                                    "@babel/plugin-proposal-class-properties"
                                ]
                            }
                        ],
                    },
                }
            ]
        },
        output: {
            filename: 'jfc-module.js',
            path: path.resolve(__dirname, 'dist'),
            libraryTarget: 'commonjs2'
        },
        plugins: [
            new webpack.DefinePlugin({
                __BUILD_VERSION: JSON.stringify(
                    `${process.env.__BUILD_VERSION || 'unversioned'}-${
                    argv.mode === 'production' ? 'prod' : 'devel'
                    }`
                )
            })
        ],
        target: 'node'
    };
};
