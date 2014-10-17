
/**
 * 模块配置与注册
 * 只写常用的
 * @type {[type]}
 */
var staticUrl = S.staticUrl = realpath(loaderDir + "../../../"),

    paths = {},

    alias = {},

    aliasConfig = {

        component: {
            switchable: "1.0.3",
            validator: "0.9.7",
            popup: "1.0.0"
        },

        plugin: {
            lazyload: "1.8.4",
            easing: "1.3"
        },

        gallery: {
            jquery: support.phone ? "2.1.1" : "1.11.1",
            handlebars: "1.3.0",
            json: "2"
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

"alias map paths".replace(rword, function(name) {
    ConfigFns[name] = function(val) {
        if (val) {
            var cfg = {};
            cfg[name] = val;
            Loader.config(cfg);
        } else {
            return data[name];
        }
    };
});


var jQuery = global.jQuery,
    jQueryFactory,
    JSON = global.JSON;

if (JSON) {
    define("json", JSON);
}

if (jQuery) {
    jQueryFactory = function() {
        return jQuery;
    };
    define("jquery", jQueryFactory);
    define("$", jQueryFactory);
}

define("tbtx", S);

var preloadConfig = {
        broadcast: {
            module: "msg"
        },
        pin: {
            module: "position"
        },
        center: {
            module: "position"
        }
    };

// 某些没有return的模块接口可以提前写入
each(preloadConfig, function(config, name) {
    var module = config.module;

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
