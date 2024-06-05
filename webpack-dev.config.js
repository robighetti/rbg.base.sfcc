'use strict';

// var path = require('path');
// var webpack = require('sgmf-scripts').webpack;
// var ExtractTextPlugin = require('sgmf-scripts')['extract-text-webpack-plugin'];
// var jsFiles = require('sgmf-scripts').createJsPath();
// var scssFiles = require('sgmf-scripts').createScssPath();


var shell = require('shelljs');
var path = require('path');
var webpack = require('sgmf-scripts').webpack;
var ExtractTextPlugin = require('sgmf-scripts')['extract-text-webpack-plugin'];

function getCartridges() {
    var cwd = process.cwd();
    var webPackCartridges = require(path.join(cwd, './webpack_cartridges.json'));
    var cartridges = webPackCartridges.cartridges || ['sfra/cartridges/app_storefront_base'];

    cartridges = cartridges.map(cartridge => { return path.join(cwd, 'cartridges', cartridge); });
    cartridges = cartridges.filter(cartridge => { return shell.find(path.join(cartridge, 'cartridge/client/')).stdout !== ''; });

    return cartridges;
}

function getFiles(cartridges, type) {
    let cwd = process.cwd();
    let files = {},
        isJS = type === 'js';
    type = isJS ? 'js/**/*.js' : 'scss/**/*.scss';

    let webPackCartridges = require(path.join(cwd, './webpack_cartridges.json'));

    cartridges.forEach(cartridge => {
        shell.ls(path.join(cartridge, 'cartridge/client/**/', type)).forEach(file => {
            let name = isJS ? '' : path.basename(file, '.scss');

            if (name.indexOf('_') !== 0) {
                let location = path.relative(path.join(cartridge, 'cartridge/client'), file).replace(/\\/g, '/');
                location = isJS ? location.substr(0, location.length - 3) : location.substr(0, location.length - 5).replace('scss', 'css');

                webPackCartridges.cartridges.forEach(webPackCartridge => {
                    if (path.basename(cartridge) == path.basename(webPackCartridge)) {
                        files[`./cartridges/${webPackCartridge}/cartridge/static/` + location] = file;
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
module.exports = [{
    mode: 'development',
    devtool: 'source-map',
    optimization: {
        minimize: false
    },
    name: 'js',
    entry: jsFiles,
    output: {
        path: path.resolve(__dirname),
        filename: '[name].js'
    },
    module: {
        rules: [
        {
            test: /\.css$/,
            exclude: /node_modules/,
            use: [
                'css-loader'
            ],
        },
        {
            test: /\.s[ac]ss$/i,
            use: [
                "style-loader",
                "css-loader",
                "sass-loader",
            ],
            },
        {
            test: /\.css$/,
            use: [
                'css-loader'
            ]
        },
        {
            test: /\.scss$/,
            use: [
                'css-loader',
                'sass-loader'
            ]
        },
        {
            test: /\.sass$/,
            use: [
                'css-loader',
                'sass-loader?indentedSyntax'
            ]
        },
        {
            test: /\.(png|jpg|gif|svg)$/,
            loader: 'file-loader',
            options: {
                name: '[name].[ext]?[hash]'
            }
        }, {
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
        }]
    },
    resolve: {
        alias: {
            base: path.resolve('cartridges/app_storefront_base/cartridge/client/default/js'),
        },
        extensions: ['.js', '.json']
    },
    plugins: [
        new webpack.ProvidePlugin(bootstrapPackages)
    ]
}, {
    mode: 'development',
    devtool: 'source-map',
    optimization: {
        minimize: false
    },
    name: 'scss',
    entry: scssFiles,
    output: {
        path: path.resolve(__dirname),
        filename: '[name].css'
    },
    module: {
        rules: [{
            test: /\.scss$/,
            use: ExtractTextPlugin.extract({
                use: [{
                    loader: 'css-loader',
                    options: {
                        url: false,
                        minimize: true,
                        sourceMap: true
                    }
                }, {
                    loader: 'postcss-loader',
                    options: {
                        plugins: [
                            require('autoprefixer')()
                        ],
                        sourceMap: true
                    }
                }, {
                    loader: 'sass-loader',
                    options: {
                        includePaths: [
                            path.resolve('node_modules'),
                            path.resolve('node_modules/flag-icon-css/sass')
                        ],
                        sourceMap: true
                    }
                }]
            })
        }]
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
}];
