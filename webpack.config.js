var webpack = require("webpack");
var path = require('path');
var HtmlWebpackPlugin = require("html-webpack-plugin");
require("webpack-dev-server");
var OpenBrowserPlugin = require('open-browser-webpack-plugin');//帮助打开浏览器
// var ExtractTextPlugin = require("extract-text-webpack-plugin");
var srcDir = path.resolve(process.cwd(), 'src/').replace(/\\/g, "/");
var config = require('./webpack/webpack.moduleConfig.js'); //引入js模块配置文件
var TARGET = process.env.npm_lifecycle_event;// 命令名称
var port = process.env.npm_package_config_port;
var devtool = "eval-source-map";
var baseEnv = require(path.resolve(process.cwd(),'webpack/config/base.path.enter.js'));
var baseApi = baseEnv['dev'];


if (TARGET === "product") {
    devtool = "";
}

module.exports = {
    devtool: 'source-map',
    // devtool: devtool,// 配置生成Source Maps，选择合适的选项
    entry: { bbb: "./src/js/tablets.js" },
    output: {
        path: __dirname + "/assets",
        // publicPath: 'dist/',
        filename: "bundle-[hash].js"
    },
    resolve: {
        modules: [srcDir,'node_modules'],
        alias: config.alias
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                loader: "style-loader!css-loader"
            },
            {
                test: /\.less$/,
                use: [
                    'style-loader',
                    { loader: 'css-loader', options: { importLoaders: 1 } },
                    { loader: 'less-loader', options: { sourceMap: true } }
                ]
            },
            {
                test: /\.(png|jpg|gif|eot|woff|svg|ttf)$/,
                loader: 'url-loader?limit=50000'
            },
            // {
            //     test: /\.(ttf)/,
            //     loader: "file-loader"
            // },
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'baseEnv': JSON.stringify(baseApi),
            __PLATFORM__: "table",
            'baseVersion':111
        }),
        new HtmlWebpackPlugin({
            template: __dirname + "/src/views/enter/app.html"
        }),
        new webpack.ProvidePlugin(config.global),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
        new OpenBrowserPlugin({
            url: 'http://localhost:' + port
        }),
        // new ExtractTextPlugin('styles.css'),
    ],
    // 自带热加载
    devServer: {
        contentBase: __dirname + "/assets/index.html",//本地服务器所加载的页面所在的目录
        historyApiFallback: true,//不跳转
        inline: true//实时刷新
    }
};


