const webpack = require('webpack');
const helpers = require('./helpers');

try {
    envConfig = require('./env.json');
} catch (ex) {

    console.error("\x1b[95m", `
    We couldn’t the “config/env.json” file.
    Please check the “config/env.example.json” for a sample on how to make your own configuration.  
    `);
    try {
        envConfig = require('./env.example.json');
    } catch (ex) {
        process.exit(1);
    }
}

/*
 * Webpack Plugins
 */
const DefinePlugin = require('webpack/lib/DefinePlugin');
const AssetsPlugin = require('assets-webpack-plugin');
const CheckerPlugin = require('awesome-typescript-loader').CheckerPlugin;
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlElementsPlugin = require('./html-elements-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const ngcWebpack = require('ngc-webpack');
const NormalModuleReplacementPlugin = require('webpack/lib/NormalModuleReplacementPlugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');

const AOT = helpers.hasNpmFlag('aot');
const METADATA = {
    title: "Rabix Editor",
    baseUrl: '/',
    host:"localhost",
    port: 9051,
    ENV: "development",
    isDevServer: helpers.isWebpackDevServer(),
    APP_ENV_CONFIG: envConfig
};

module.exports = function () {

    return {
        cache: true,
        entry: {
            polyfills: "./src/polyfills.ts",
            main: AOT ? "./src/main.electron.aot.ts" : "./src/main.electron.ts"
        },

        resolve: {
            extensions: [".ts", ".js", ".json"],
            modules: ["node_modules", helpers.root("src")],

        },

        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: [
                        'awesome-typescript-loader?{configFileName: "tsconfig.webpack.json"}',
                        'angular2-template-loader',
                    ],
                    exclude: [/\.(spec|e2e)\.ts$/]
                },
                {
                    test: /\.json$/,
                    use: 'json-loader'
                },
                {
                    test: /\.css$/,
                    use: ['to-string-loader', 'css-loader'],
                    exclude: [helpers.root('src', 'styles')]
                },
                {
                    test: /\.scss$/,
                    use: ["style-loader", "css-loader", "sass-loader"],
                },
                {
                    test: /\.html$/,
                    use: 'raw-loader',
                    exclude: [helpers.root('src/index.html')]
                },
                {
                    test: /\.(jpg|png|gif)$/,
                    use: 'file-loader'
                },
                {
                    test: /\.(eot|woff|woff2|ttf|svg|gif|png|jpg)(\?.*$|$)$/,
                    loader: 'url-loader?limit=30000&name=[name]-[hash].[ext]'
                }

            ],
        },

        plugins: [

            new DefinePlugin({
                'ENV': JSON.stringify(METADATA.ENV),
                "ENV_PARAMS": JSON.stringify(METADATA.APP_ENV_CONFIG),
                'process.env': {
                    'ENV': JSON.stringify(METADATA.ENV),
                    'NODE_ENV': JSON.stringify(METADATA.ENV),
                }
            }),

            new AssetsPlugin({
                path: helpers.root("dist"),
                filename: "webpack-assets.json",
                prettyPrint: true
            }),
            new CheckerPlugin(),
            new CommonsChunkPlugin({
                name: "polyfills",
                chunks: ["polyfills"]
            }),
            new CommonsChunkPlugin({
                name: "vendor",
                chunks: ["main"],
                minChunks: module => /node_modules\//.test(module.resource)
            }),
            new CommonsChunkPlugin({
                name: ["polyfills", "vendor"].reverse()
            }),
            new ContextReplacementPlugin(
                // The (\\|\/) piece accounts for path separators in *nix and Windows
                /angular(\\|\/)core(\\|\/)src(\\|\/)linker/,
                helpers.root('src'), // location of your src
                {
                    // your Angular Async Route paths relative to this root directory
                }
            ),
            new CopyWebpackPlugin([
                {from: "src/assets", to: "assets"},
                {from: "node_modules/jailed/lib"},
                {
                    from: "node_modules/font-awesome/css/font-awesome.min.css",
                    to: "assets/font-awesome/css/font-awesome.css"
                },
                {
                    from: "node_modules/font-awesome/fonts",
                    to: "assets/font-awesome/fonts"
                }
            ]),

            new HtmlWebpackPlugin({
                template: 'src/index.html',
                title: METADATA.title,
                chunksSortMode: 'dependency',
                metadata: METADATA,
                inject: 'head'
            }),
            new ScriptExtHtmlWebpackPlugin({
                defaultAttribute: 'defer'
            }),

            new HtmlElementsPlugin({
                headTags: require('./head-config.common')
            }),

            new LoaderOptionsPlugin({}),

            new NormalModuleReplacementPlugin(
                /facade(\\|\/)async/,
                helpers.root('node_modules/@angular/core/src/facade/async.js')
            ),
            new NormalModuleReplacementPlugin(
                /facade(\\|\/)collection/,
                helpers.root('node_modules/@angular/core/src/facade/collection.js')
            ),
            new NormalModuleReplacementPlugin(
                /facade(\\|\/)errors/,
                helpers.root('node_modules/@angular/core/src/facade/errors.js')
            ),
            new NormalModuleReplacementPlugin(
                /facade(\\|\/)lang/,
                helpers.root('node_modules/@angular/core/src/facade/lang.js')
            ),
            new NormalModuleReplacementPlugin(
                /facade(\\|\/)math/,
                helpers.root('node_modules/@angular/core/src/facade/math.js')
            ),

            new ngcWebpack.NgcWebpackPlugin({
                disabled: !AOT,
                tsConfig: helpers.root('tsconfig.webpack.json'),
                resourceOverride: helpers.root('config/resource-override.js')
            }),
        ],

        node: {
            global: true,
            crypto: "empty",
            process: true,
            module: false,
            clearImmediate: false,
            setImmediate: false
        }
    }
};
