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

    require.config({
        baseUrl: baseUrl,
        urlArgs: "2013.10.15.0",
        paths: {
            "jquery": "base/js/jquery/jquery-1.8.3.min",
            "tbtx": "base/js/tbtx",
            // component
            "popup": "base/js/component/overlay.popup",
            "slide": "base/js/component/slide",
            "soltMachine": "base/js/component/soltMachine",
            "validator": "base/js/component/validator",
            "sns": "base/js/component/sns",
            "draggable": "base/js/component/draggable",
            "pagination": "base/js/component/pagination",
            // plugin
            "easing": "base/js/plugin/jquery.easing.1.3",
            "validate": "base/js/plugin/jquery.validate.min",
            "imagesloaded": "base/js/plugin/imagesloaded.min",
            "lazyload": "base/js/plugin/jquery.lazyload",

            "swfobject": "base/js/plugin/swfobject",
            "handlebars": "miiee/js/handlebars",
            "Tween": "miiee/js/order/TweenMax.min",
            "moment": "miiee/js/moment.min",

            // kissy的require与requirejs有冲突，
            // 这两个不能使用requirejs加载
            "kissy": "http://a.tbcdn.cn/s/kissy/1.2.0/kissy-min",
            "SNS": "http://a.tbcdn.cn/p/snsdk/core"
        },
        waitSeconds: 10,
        shim: {
            // jquery and tbtx component
            "jquery": {
                exports: "jQuery"
            },
            "tbtx": {
                deps: ["jquery"],
                exports: "tbtx"
            },

            // tbtx component
            "popup": {
                deps: ["tbtx"],
                exports: "tbtx.Popup"
            },
            "validator": {
                deps: ["tbtx"],
                exports: "tbtx.Validator"
            },
            "slide": {
                deps: ["tbtx"],
                exports: "tbtx.Slide"
            },
            "soltMachine": {
                deps: ["tbtx"],
                exports: "tbtx.SoltMachine"
            },
            "sns": {
                deps: ["tbtx"],
                exports: "tbtx.SNS"
            },
            "draggable": {
                deps: ["tbtx"],
                exports: "tbtx.draggable"
            },
            "pagination": {
                deps: ["tbtx"],
                exports: "tbtx.Pagination"
            },

            // jq plugin
            "easing": {
                deps: ["jquery"]
            },
            "validate": {
                deps: ["jquery"],
                exports: "jQuery.validator"
            },
            "lazyload": {
                deps: ["jquery"]
            },
            "imagesloaded": {
                deps: ["jquery"]
            },


            "kissy": {
                exports: "KISSY"
            },
            "SNS": {
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