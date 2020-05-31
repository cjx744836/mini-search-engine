const path = require('path');
const MyPlugin = require('./myplugin');
const webpack = require('webpack');

module.exports = {
    entry: {
        index: './src/server/public/js/index.js',
        login: './src/server/public/js/login.js',
        manager: './src/server/public/js/manager.js',
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    mode: 'production',
    optimization: {
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10,
                    name: 'vendor'
                }
            }
        }
    },
    plugins: [
      new MyPlugin()
    ],
    output: {
        path: path.resolve(__dirname, './src/server/public/js'),
        filename: '[name].build.js'
    }
};