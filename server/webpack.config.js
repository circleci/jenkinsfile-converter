const path = require('path');

const webpack = require('webpack');

module.exports = (env, argv) => {
    return {
        entry: './src/main.ts',
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/
                }
            ]
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js']
        },
        output: {
            filename: 'server.js',
            path: path.resolve(__dirname, 'dist')
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
