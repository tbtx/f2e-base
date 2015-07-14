
/**
 * 模块配置与注册
 * 只写常用的
 * @type {[type]}
 */
var staticUrl = realpath(loaderDir + "../../../"),

    paths = {},

    alias = {},

    aliasConfig = {

        component: {
            switchable: "1.0.4",
            validator: "0.9.7",
            popup: "1.0.0"
        },

        plugin: {
            lazyload: "2.8.4",
            easing: "1.3"
        },

        gallery: {
            jquery: "2.1.1",
            handlebars: "1.3.0",
            hammer: "2.0.4"
        },

        arale: {
            base: "1.1.1",
            widget: "1.1.1",

            position: "1.0.1"
        },

        dist: {
            msg: "1.0.0"
        }
    },

    // 目录规范
    dirPattern = "{{ dir }}/{{ name }}/{{ version }}/{{ name }}";

each(aliasConfig, function(config, dir) {

    paths[dir] = realpath(loaderDir + "../../") + dir;

    each(config, function(v, name) {
        alias[name] = substitute(dirPattern, {
            dir: dir,
            name: name,
            version: v
        });
    });
});

alias.$ = alias.jquery;

Loader.config({

    base: staticUrl,

    alias: alias,

    paths: paths

});

if (!_config("debug")) {
    var scriptstamp = Math.floor(Date.now() / 3600000);
    Loader.config({
        // 每小时更新时间戳
        map: [
            function(uri) {
                if (uri.indexOf("t=") === -1) {
                    return uri.replace(/^(.*\.(?:css|js))(.*)$/i, "$1?t=" + scriptstamp);
                }
            }
        ]
    });
}

define("tbtx", S);
define("json", global.JSON);
if (typeof jQuery !== undefined + "") {
    define("jquery", function() {
        return jQuery;
    });
}

var preloadConfig = {
    broadcast: "msg",
    pin: "position",
    center: "position"
};

// 某些没有return的模块接口可以提前写入
each(preloadConfig, function(module, name) {

    S[name] = function() {
        var args = arguments;

        require(module, function(exports) {
            var fn = exports[name];

            if (isFunction(fn)) {
                fn.apply(S, args);
                S[name] = fn;
            }
        });
    };
});