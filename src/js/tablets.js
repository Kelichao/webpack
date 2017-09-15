/*!
 * @description: 较为常用的工具集合
 * @author: kelichao
 * @update: 2016-11-19
 * @update: 2016-12-28 / 增加了埋点文件以及调用客户端接口文件的方法
 * @update: 2017-01-04 / 增加了MVC架构
 * @update: 2017-02-25 / 开始增加移动端函数
 * @https://github.com/Kelichao/kit.js
 */
require("../css/style.less");

// 引入Sweet Mobile核心模块
require('Framework7'); // 引入Framework7框架
const controllers = require('../sweet/sweet.controller');
var requestApi = appConfig.baseEnv;
var util = require('util');

window.$$ = Dom7; // 定义类似jQuery的操作DOM的对象为全局对象:$$

window.PLATFORM = String("table"); //平台

class Sweet{
	constructor(){
		this.v = "0.1.5";
		this.controllers = controllers;
	}

	setWinH() {
        $("body").css({
            "min-height": $(window).height()
        });
    }

    _beforeInit() {
        const that = this;
        that.setWinH();
        $(window).resize(function() {
            that.setWinH();
        });
    }

    _init(initUrl, params, initFn) {
        const that = this;
        that._beforeInit();
        let defaults = {
            modalTitle: "易云科技",
            modalButtonOk: "确定",
            modalButtonCancel: "取消",
            modalPreloaderTitle: "加载中…",
            cache: false,
            animateNavBackIcon: true,
            uniqueHistory: true,
            preroute: function(view, options) {
                if(view.history[0] != initUrl){
                    view.history[0] = initUrl;
                    //return false;
                }
            },
            onPageBeforeInit: function(myApp, page) {
                if (page.url === initUrl) {
                    const mainViewEl = $('#mainView');
                    if (page.fromPage) {
                        mainViewEl.find('.navbar-on-left .back').remove();
                    } else {
                        mainViewEl.find('.navbar-on-center .back').remove();
                    }
                }
            },

            pushState: true,
            pushStateNoAnimation: true
        };

        let initParams = $.extend(defaults, params);

        initParams.onPageInit = function(myApp, page) {
            const controllers = that.controllers;
            const next = function(callback) {
                if (page.name) {
                    const ctrlName = page.name.replace('View', '');
                    // 调用模块方法
                    if (typeof controllers[ctrlName] === "function") {
                        controllers[ctrlName](page,callback);
                    }
                }
            };

            if (page.url) {
                params.onPageInit(myApp, page, next);
            }else{
                next();
            }
            
        };
        if (typeof initParams.beforeInit === 'function'){
            initParams.beforeInit();
        }

        // 实例化Framework7框架
        window.myApp = new Framework7(initParams);
        const mainViewParams = { name: "mainView", dynamicNavbar: true };

        this.mainView = myApp.addView("#mainView", mainViewParams);// 添加视图view
        this.btmView = myApp.addView(".view-bottombar", {});// 底部视图容器
        this.rightPanelView = myApp.addView(".view-right-panel", {});// 侧边视图容器

        if (!this.mainView.activePage) {
            this.mainView.router.load({
                url: initUrl,
                animatePages: false,
                reload: true,
                force: true
            });
        }
        if (typeof initFn === 'function') initFn(myApp);
	}

	init(params, initFn){
        const hashUrl = window.location.hash;
        const initUrl ='views/index.html';
        this._init(initUrl, params, initFn);
        this.welcome();
        return this;
	}

	loadController(pagename){
        this.controllers[pagename]();
    }

     /**
     * 封装的模板使用方法
     * @tplElement：获取html模板的选择器，此处为class或者id。建议使用id
     * @renderElement：完成数据绑定，需要渲染到页面上的容器选择器，此处为class或者id。建议使用id
     * @data：需要绑定的数据
     * @isAppend: true 为追加内容，false 全部替换
     * @callback：渲染完成后的回调方法
     */
    
    tpl(params) {
        const appendBln = typeof params.isAppend === 'boolean' && params.isAppend;
        const tplElement = params.tplElement;
        const renderElement = params.renderElement;
        const renderData = params.data;
        const callback = params.callback;
        const tplHtml = $$(tplElement).html();
        const tpl = Template7.compile(tplHtml);
        const html = tpl(renderData);
        if (renderElement) {
            if (appendBln) {
                $$(renderElement).append(html);
            } else {
                $$(renderElement).html(html);
            }
        }
        if (typeof callback == "function") callback();
    }

    welcome() {
        const that = this;
        console.group('%c欢迎使用Sweet-Mobile v' + that.v, 'font-size:14px;color:#296ab4;');
        console.log('%c Sweet Mobile 是一个前后端分离，自动化，模块化，拥有强大丰富组件库，高效的移动端前端开发框架', 'color:#999');
        console.groupEnd();
    }
}
    
window.Sweet = new Sweet();

    



// 国际化
i18next.use(i18nextXHR)
    .use(i18nCache)
    .use(i18nLanguageDetector)
    .init({
        "backend": {
            "loadPath": requestApi.api.i18Url,
            //"loadPath" : "http://10.86.87.137:8099/client-server/manage/grestful/localeResource/queryLocaleResources?siteCode=1310&resourceSet=ClientResources&languageCode={{lng}}",
            "crossDomain": true
        },
        "keySeparator": "@"
    });

i18next.on('languageChanged', function (lng) {
    if ('zh' == lng) {
        moment.locale('zh-cn');
    } else {
        moment.locale(lng);
    }
    util.translate();
});

moment.locale('zh-cn');


// 因为国际化文件是ajax调用的，异步进行，所以需要在调用完成之后再执行其他模块
i18next.on('initialized', function (options) {
    // 通过Sweet启动
    window.Sweet.init({
        material: true,
        modalTitle: "提示",
        materialRipple: false,
        precompileTemplates: true,
        onPageInit: function (myApp, page, next) {
            //每次执行onPageInit时都会去会去校验
            app.checkLogin(next, function () {
                // 统一移除热键
                $(document).off("keydown");
                $(document).off("keyup");

                // 退出全屏
                util.exitFullscreen();

                // 0键返回到主页
                $(document).keydown(function (event) {
                    var typeFlag = event.target.nodeName === "BODY";
                    if ((event.keyCode === 48 || event.keyCode === 96) && typeFlag) {
                        console.log(event.target.type);
                         Sweet.mainView.router.load({
                            url: "views/index.html"
                        });
                    }
                });

                // 国际化
                util.translate('.page[data-page="' + page.name + '"]');
            });
        }
    }, function () {
        //F7初始化完成执行
        app.init();
    });

});

if (module.hot) {
    module.hot.accept();
}

module.exports = Sweet;
