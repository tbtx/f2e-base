(function(S){

    var global = S.global,
        register = S.register;

    // require to get the jquery exports
    S.define.amd.jQuery = true;

    /*
     * shim config
     */
    if (global.JSON) {
        register("json");
    }

    var $ = global.jQuery || global.Zepto;
    if ($) {
        register("jquery", $);
        register("$", $);
    }

    // events
    S.require("events", function(Events) {
        S.Events = Events;
        Events.mixTo(S);
    });

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
    S.each(preloadConfig, function(config, name) {
        var module = config.module || name;

        S[name] = function() {
            var args = arguments;

            S.require(module, function(exports) {
                var fn = exports[name] || exports;
                fn.apply(S, args);
            });
        };
    });
})(tbtx);