(function(S) {
    var realpath = S.realpath,
        Loader = S.Loader,
        loaderDir = Loader.data.dir,
        staticUrl = S.staticUrl = realpath(loaderDir + "../../../");

    /**
     * paths config
     */
    var paths = {};

    ["dist", "plugin", "gallery", "component"].forEach(function(name) {
        paths[name] = loaderDir + name;
    });

    paths.arale = loaderDir + "dist/arale";

    Loader.config({
        base: staticUrl,

        alias: {
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
            "jquery": "gallery/jquery/1.8.3/jquery.min",
            "zepto": "gallery/zepto/1.1.2/zepto.min",
            "handlebars": "gallery/handlebars/1.3.0/handlebars",
            "json": "gallery/json2/json2",

            // plugin
            "easing": "plugin/jquery.easing.1.3",

            "kissy": "http://g.tbcdn.cn/kissy/k/1.4.0/seed-min.js"
        },

        paths: paths

    });
})(tbtx);