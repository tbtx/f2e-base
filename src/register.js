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

        S.require("request");
    }

    S.require("events", function(Events) {
        S.Events = Events;
        Events.mixTo(S);
    });
})(tbtx);