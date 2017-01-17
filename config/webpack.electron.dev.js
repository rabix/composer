const helpers = require('./helpers');
const webpackMerge = require('webpack-merge'); //
const webpackMergeDll = webpackMerge.strategy({plugins: "replace"});
const commonConfig = require('./webpack.common.js');

const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const NamedModulesPlugin = require('webpack/lib/NamedModulesPlugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const DllBundlesPlugin = require('webpack-dll-bundles-plugin').DllBundlesPlugin;

const ENV = process.env.ENV = process.env.NODE_ENV = 'development';

const METADATA = webpackMerge(commonConfig({env: ENV}).metadata, {
    host: 'localhost',
    port: 9051,
    ENV: ENV,
});

module.exports = function (options) {
    return webpackMerge(commonConfig({env: ENV}), {
        devtool: "cheap-module-source-map",
        output: {
            path: helpers.root("dist"),
            filename: "[name].bundle.js",
            sourceMapFilename: "[file].map",
            chunkFilename: "[id].chunk.js",
            library: "ac_[name]",
            libraryTarget: "var"
        },
        // module: {
        //     rules: [
        //
        //         /*
        //          * css loader support for *.css files (styles directory only)
        //          * Loads external css styles into the DOM, supports HMR
        //          *
        //          */
        //         {
        //             test: /\.css$/,
        //             use: ['style-loader', 'css-loader'],
        //             include: [helpers.root('src', 'styles')]
        //         },
        //
        //         /*
        //          * sass loader support for *.scss files (styles directory only)
        //          * Loads external sass styles into the DOM, supports HMR
        //          *
        //          */
        //         {
        //             test: /\.scss$/,
        //             use: ['style-loader', 'css-loader', 'sass-loader'],
        //             include: [helpers.root('src', 'assets/scss')]
        //         },
        //
        //     ]
        // },

        plugins: [


            new DllBundlesPlugin({
                bundles: {
                    polyfills: [
                        'core-js',
                        {
                            name: 'zone.js',
                            path: 'zone.js/dist/zone.js'
                        },
                        {
                            name: 'zone.js',
                            path: 'zone.js/dist/long-stack-trace-zone.js'
                        },
                        'ts-helpers',
                    ],
                    vendor: [
                        '@angular/platform-browser',
                        '@angular/platform-browser-dynamic',
                        '@angular/core',
                        '@angular/common',
                        '@angular/forms',
                        '@angular/http',
                        'rxjs',
                        "brace"
                    ]
                },
                dllDir: helpers.root('dll'),
                webpackConfig: webpackMergeDll(commonConfig({env: ENV}), {
                    devtool: 'cheap-module-source-map',
                    plugins: []
                })
            }),

            new AddAssetHtmlPlugin([
                {filepath: helpers.root(`dll/${DllBundlesPlugin.resolveFile('polyfills')}`)},
                {filepath: helpers.root(`dll/${DllBundlesPlugin.resolveFile('vendor')}`)}
            ]),

            new LoaderOptionsPlugin({
                debug: true,
                options: {}
            }),
        ],

        devServer: {
            port: METADATA.port,
            host: METADATA.host,
            historyApiFallback: true,
            watchOptions: {
                aggregateTimeout: 300,
                poll: 1000
            }
        },
    });
};
