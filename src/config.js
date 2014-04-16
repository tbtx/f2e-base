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


    Loader.config({
        base: staticUrl,

        alias: {
            "widget": "dist/widget.js",

            "jquery": "gallery/jquery/1.8.3/jquery.min.js",
            "handlebars": "gallery/handlebars/1.3.0/handlebars.js",
            "easing": "plugin/jquery.easing.1.3.js",
            "json": "gallery/json2/json2.js"
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
})(tbtx);