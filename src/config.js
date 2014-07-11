(function(S) {
    var realpath = S.realpath,
        Loader = S.Loader,
        loaderDir = Loader.data.dir,
        staticUrl = S.staticUrl = realpath(loaderDir + "../../../");

    /**
     * paths config
     */
    var paths = {},
        alias = {
            // arale
            "events": "arale/events/1.1.0/events",
            "class": "arale/class/1.1.0/class",
            "base": "arale/base/1.1.1/base",
            "widget": "arale/widget/1.1.1/widget",
            "position": "arale/position/1.0.1/position",
            "detector": "arale/detector/1.3.0/detector",

            // dist
            "router": "dist/router",

            // component
            "overlay": "component/overlay/1.1.4/overlay",
            "popup": "component/popup/1.0.0/popup",
            "switchable": "component/switchable/1.0.3/switchable",
            "validator": "component/validator/0.9.7/validator",

            // gallery
            "jquery": S.support.phone ? "gallery/jquery/2.1.1/jquery.min" : "gallery/jquery/1.8.3/jquery.min",
            "zepto": "gallery/zepto/1.1.2/zepto.min",
            "handlebars": "gallery/handlebars/1.3.0/handlebars",
            "json": "gallery/json2/json2",

            // 2.1.5不支持IE8
            "clipboard": "gallery/zeroclipboard/1.3.5/ZeroClipboard.min",

            // plugin
            "easing": "plugin/jquery.easing.1.3",

            "kissy": "http://g.tbcdn.cn/kissy/k/1.4.0/seed-min.js"
        };

    ["dist", "plugin", "gallery", "component"].forEach(function(name) {
        paths[name] = loaderDir + name;
    });

    paths.arale = loaderDir + "dist/arale";

    alias.$ = alias.jquery;

    Loader.config({
        base: staticUrl,

        alias: alias,

        paths: paths,

        // 每小时更新时间戳
        map: [
            [/^(.*\.(?:css|js))(.*)$/i, "$1?t=" + Math.floor(Date.now() / 3600000)]
        ]
    });
})(tbtx);