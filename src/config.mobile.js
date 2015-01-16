
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
            switchable: "1.0.3",
            validator: "0.9.7"
        },

        plugin: {
            lazyload: "1.8.4",
            easing: "1.3"
        },

        gallery: {
            jquery: "2.1.1",
            handlebars: "1.3.0",
            store: "1.3.17"
        },

        arale: {
            base: "1.1.1",
            widget: "1.1.1"
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