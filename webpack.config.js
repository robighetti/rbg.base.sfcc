'use strict';

var shell = require('shelljs');
var path = require('path');
const { env } = require('process');
var webpack = require('sgmf-scripts').webpack;
var ExtractTextPlugin = require('sgmf-scripts')['extract-text-webpack-plugin'];

function getCartridges() {
    let cwd = process.cwd();
    let webPackCartridges = require(path.join(cwd, './webpack_cartridges.json'));
    let cartridges = webPackCartridges.cartridges;

    cartridges = cartridges.map((cartridge) => {
        return path.join(cwd, 'cartridges', cartridge);
    });
    cartridges = cartridges.filter((cartridge) => {
        return (
            shell.find(path.join(cartridge, 'cartridge/client/')).stdout !== ''
        );
    });

    return cartridges;
}

function getFiles(cartridges, type) {
    let cwd = process.cwd();
    let files = {};
    let isJS = type === 'js';
    type = isJS ? 'js/**/*.js' : 'scss/**/*.scss';

    let webPackCartridges = require(path.join(
        cwd,
        './webpack_cartridges.json'
    ));

    cartridges.forEach((cartridge) => {
        shell
            .ls(path.join(cartridge, 'cartridge/client/**/', type))
            .forEach((file) => {
                let name = isJS ? '' : path.basename(file, '.scss');

                if (name.indexOf('_') !== 0) {
                    let location = path
                        .relative(
                            path.join(cartridge, 'cartridge/client'),
                            file
                        )
                        .replace(/\\/g, '/');
                    location = isJS
                        ? location.substr(0, location.length - 3)
                        : location
                              .substr(0, location.length - 5)
                              .replace('scss', 'css');

                    webPackCartridges.cartridges.forEach((webPackCartridge) => {
                        if (path.basename(cartridge) === path.basename(webPackCartridge)) {
                            files[
                                `./cartridges/${webPackCartridge}/cartridge/static/` +
                                    location
                            ] = file;
                        }
                    });
                }
            });
    });

    return files;
}

var cartridges = getCartridges();
var jsFiles = getFiles(cartridges, 'js');
var scssFiles = getFiles(cartridges, 'scss');

var bootstrapPackages = {
    Alert: 'exports-loader?Alert!bootstrap/js/src/alert',
    // Button: 'exports-loader?Button!bootstrap/js/src/button',
    Carousel: 'exports-loader?Carousel!bootstrap/js/src/carousel',
    Collapse: 'exports-loader?Collapse!bootstrap/js/src/collapse',
    // Dropdown: 'exports-loader?Dropdown!bootstrap/js/src/dropdown',
    Modal: 'exports-loader?Modal!bootstrap/js/src/modal',
    // Popover: 'exports-loader?Popover!bootstrap/js/src/popover',
    Scrollspy: 'exports-loader?Scrollspy!bootstrap/js/src/scrollspy',
    Tab: 'exports-loader?Tab!bootstrap/js/src/tab',
    // Tooltip: 'exports-loader?Tooltip!bootstrap/js/src/tooltip',
    Util: 'exports-loader?Util!bootstrap/js/src/util'
};
module.exports = [
    {
        mode: env.production ? 'production' : 'development',
        optimization: {
            minimize: env.production
        },
        name: 'js',
        entry: jsFiles,
        output: {
            path: path.resolve(__dirname),
            filename: '[name].js'
        },
        devtool: 'source-map',
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: [
                        'vue-style-loader',
                        'css-loader'
                    ],
                },
                {
                    test: /\.scss$/,
                    use: [
                        'vue-style-loader',
                        'css-loader',
                        'sass-loader'
                    ],
                },
                {
                    test: /\.sass$/,
                    use: [
                        'vue-style-loader',
                        'css-loader',
                        'sass-loader?indentedSyntax'
                    ],
                },
                {
                    test: /\.vue$/,
                    loader: 'vue-loader',
                    options: {
                        loaders: {
                            'scss': [
                                'vue-style-loader',
                                'css-loader',
                                'sass-loader'
                            ],
                            'sass': [
                                'vue-style-loader',
                                'css-loader',
                                'sass-loader?indentedSyntax'
                            ]
                        }
                    }
                },
                {
                    test: /\.css$/,
                    use: ['css-loader']
                },
                {
                    test: /\.scss$/,
                    use: ['css-loader', 'sass-loader']
                },
                {
                    test: /\.sass$/,
                    use: ['css-loader', 'sass-loader?indentedSyntax']
                },
                {
                    test: /\.(png|jpg|gif|svg)$/,
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]?[hash]'
                    }
                },
                {
                    test: /bootstrap(.)*\.js$/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/env'],
                            plugins: ['@babel/plugin-proposal-object-rest-spread'],
                            cacheDirectory: true,
                            sourceMap: true
                        }
                    }
                }
            ]
        },
        resolve: {
            alias: {
                base: path.resolve('cartridges/app_storefront_base/cartridge/client/default/js'),
            },
            extensions: ['.js', '.json', '.vue']
        },
        plugins: [
            new webpack.ProvidePlugin(bootstrapPackages)
        ]
    },
    {
        mode: env.production ? 'production' : 'development',
        optimization: {
            minimize: env.production
        },
        name: 'scss',
        entry: scssFiles,
        output: {
            path: path.resolve(__dirname),
            filename: '[name].css'
        },
        devtool: 'source-map',
        module: {
            rules: [
                {
                    test: /\.scss$/,
                    use: ExtractTextPlugin.extract({
                        use: [
                            {
                                loader: 'css-loader',
                                options: {
                                    url: false,
                                    minimize: true,
                                    sourceMap: true
                                }
                            },
                            {
                                loader: 'postcss-loader',
                                options: {
                                    plugins: [require('autoprefixer')()],
                                    sourceMap: true
                                }
                            },
                            {
                                loader: 'sass-loader',
                                options: {
                                    includePaths: [
                                        path.resolve('node_modules'),
                                        path.resolve(
                                            'node_modules/flag-icon-css/sass'
                                        )
                                    ],
                                    sourceMap: true
                                }
                            }
                        ]
                    })
                }
            ]
        },
        resolve: {
            alias: {
                base: path.resolve('cartridges/app_storefront_base/cartridge/client/default/scss'),
            },
            extensions: ['.scss']
        },
        plugins: [
            new ExtractTextPlugin({ filename: '[name].css' })
        ]
    }
];
