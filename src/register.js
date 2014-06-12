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

    // msg
    S.broadcast = function() {
        var args = arguments;

        S.require("msg", function(broadcast) {
            broadcast.apply(S, args);
        });
    };

    // Position
    ["pin", "center"].forEach(function(name) {
        S[name] = function() {
            var args = arguments;
            S.require("position", function(Position) {
                Position[name].apply(S, args);
                S[name] = Position[name];
            });
        };
    });
})(tbtx);