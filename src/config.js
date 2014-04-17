(function(S) {
    var realpath = S.realpath,
        global = S.global,
        Loader = S.Loader,
        data = Loader.data;

    var loaderDir = data.dir,
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
            "widget": "arale/widget/1.1.1/widget",
            "position": "arale/position/1.0.1/position",

            // dist
            "cookie": "dist/cookie/1.0/cookie",

            // component
            "overlay": "component/overlay/1.1.4/overlay",
            "popup": "component/popup/1.0/popup",

            // gallery
            "$": "gallery/jquery/1.8.3/jquery.min",
            "jquery": "gallery/jquery/1.8.3/jquery.min",
            "handlebars": "gallery/handlebars/1.3.0/handlebars",
            "easing": "plugin/jquery.easing.1.3",
            "json": "gallery/json2/json2"
        },

        paths: paths

    });

    // require to get the jquery exports
    S.define.amd.jQuery = true;

    /*
     * shim config
     */
    if (global.JSON) {
        S.register("json");
    }
    if (global.jQuery) {
        S.register("jquery", jQuery);
        S.register("$", jQuery);
    }
})(tbtx);