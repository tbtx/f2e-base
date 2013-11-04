(function(global) {
    var doc = document,
        scripts = doc.scripts,
        loaderScript = scripts[scripts.length - 1];

    // config文件所在url
    var scriptUrl = getScriptAbsoluteSrc(loaderScript),
        baseUrl
        deep = 4;       // config文件目录深度 base/js/gallery/config.js

    var arr = scriptUrl.split('/');
    arr.splice(arr.length - deep, deep);
    baseUrl = arr.join('/');

    global.tbtx = global.tbtx || {};
    global.tbtx.staticUrl = baseUrl;

    require.config({
        baseUrl: baseUrl,
        urlArgs: "2013.10.15.0",
        paths: {
            "jquery": "base/js/jquery/jquery-1.8.3.min",
            "easing": "base/js/plugin/jquery.easing.1.3",
            "tbtx": "base/js/tbtx",
            "popup": "base/js/component/overlay.popup",
            "slide": "base/js/component/slide",
            "soltMachine": "base/js/component/soltMachine",
            "validate": "base/js/plugin/jquery.validate.min",
            "imagesloaded": "base/js/plugin/imagesloaded.min",

            "swfobject": "base/js/plugin/swfobject",
            "handlebars": "miiee/js/handlebars",
            "Tween": "miiee/js/order/TweenMax.min",
            "moment": "miiee/js/moment.min",

            // kissy的require与requirejs有冲突，
            // 这两个不能使用requirejs加载
            "kissy": "http://a.tbcdn.cn/s/kissy/1.2.0/kissy-min",
            "sns": "http://a.tbcdn.cn/p/snsdk/core"
        },
        waitSeconds: 10,
        shim: {
            // jquery and tbtx component
            "jquery": {
                exports: "jQuery"
            },
            "easing": {
                deps: ["jquery"]
            },
            "tbtx": {
                deps: ["jquery"],
                exports: "tbtx"
            },
            "popup": {
                deps: ["tbtx"],
                exports: "tbtx.Popup"
            },
            "validate": {
                deps: ["jquery"]
            },
            "imagesloaded": {
                deps: ["jquery"]
            },
            "slide": {
                deps: ["tbtx"],
                exports: "tbtx.Slide"
            },
            "soltMachine": {
                deps: ["tbtx"],
                exports: "tbtx.SoltMachine"
            },

            "kissy": {
                exports: "KISSY"
            },
            "sns": {
                deps: ['kissy']
            },

            // 第三方文件
            "handlebars": {
                exports: "Handlebars"
            },
            "swfobject": {
                exports: "swfobject"
            },
            "Tween": {
                deps: ["jquery"]
            },
            "moment": {
                exports: "moment"
            }
        }
    });

    // 获取脚本的绝对url
    function getScriptAbsoluteSrc(node) {
        return node.hasAttribute ? // non-IE6/7
            node.src :
            // see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
            node.getAttribute("src", 4);
    }
})(this);