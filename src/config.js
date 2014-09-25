
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
            validator: "0.9.7"
        },

        plugin: {

        },

        gallery: {
            jquery: "1.11.1",
            handlebars: "1.3.0",
            json: "2"
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

if (!S.config("debug")) {
    Loader.config({
        // 每小时更新时间戳
        map: [
            function(uri) {
                // if (S.inArray(["msg", "position", "request"], uri.slice(staticUrl.length, uri.length - 3))) {
                //     return;
                // }
                if (uri.indexOf("t=") === -1) {
                    return uri.replace(/^(.*\.(?:css|js))(.*)$/i, "$1?t=" + Math.floor(Date.now() / 3600000));
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

