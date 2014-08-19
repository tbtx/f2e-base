(function(S){

    var global = S.global,
        define = S.define,
        require = S.require,
        $;

    // require to get the jquery exports
    define.amd.jQuery = true;

    /*
     * shim config
     */
    if (global.JSON) {
        define("json", global.JSON);
    }

    $ = global.jQuery || global.Zepto;
    if ($) {
        define("jquery", function() {
            return $;
        });
        define("$", function() {
            return $;
        });
    }

    // events
    require("events", function(Events) {
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

            require(module, function(exports) {
                var fn = exports[name] || exports;
                fn.apply(S, args);
            });
        };
    });

})(tbtx);