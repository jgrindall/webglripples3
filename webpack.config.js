const path = require('path');
const ROOT = path.resolve( __dirname, 'src' );
const DESTINATION = path.resolve( __dirname, 'dist' );

module.exports = {
    context: ROOT,
    entry: {
        'main': './main.ts'
    },
    output: {
        filename: 'main.js',
        path: DESTINATION
    },
    resolve: {
        extensions: ['.ts', '.js'],
        modules: [
            ROOT,
            'node_modules'
        ]
    },
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.js$/,
                use: 'source-map-loader'
            },
            {
                enforce: 'pre',
                test: /\.ts$/,
                exclude: /node_modules/,
                use: 'tslint-loader'
            },
            {
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader' ]
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/,
                use: [
                  {
                    loader: 'file-loader',
                    options: {
                      name: '[path][name].[ext]'
                    }
                  }
                ]
            },
            {
                test: /\.ts$/,
                exclude: [
                    /node_modules/
                ],
                use: 'ts-loader'
            },
            {
                // used in busy beats and microbit
                test: [
                    /\.vert$/,
                    /\.frag$/
                ],
                use: 'raw-loader'
            }
        ]
    },
    devtool: 'cheap-module-source-map',
    devServer: {
        staticOptions: {
            directory: path.join(__dirname, '/src'),
            publicPath: '/'
        }
    }
};
