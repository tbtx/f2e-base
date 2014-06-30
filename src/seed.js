(function(global, S, undefined) {

    var isSupportConsole = global.console && console.log,
        noop = function() {};

    S = global[S] = global[S] || {};

    mix(S, {

        /**
         * 在log环境下输出log信息，避免因为忘记删除log语句而引发错误
         * @param  {String} msg 消息
         * @param  {String} cat 类型，如error/info等，可选
         * @param  {String} src 消息来源，可选
         * @return {Object}     返回tbtx以链式调用，如tbtx.log().log()
         */
        log: isSupportConsole ? function(msg, cat, src) {
            if (src) {
                msg = src + ": " + msg;
            }
            console[cat && console[cat] ? cat : "log"](msg);

            return this;
        } : noop,

        /**
         * Throws error message.
         */
        error: function (msg) {
            throw msg instanceof Error ? msg : new Error(msg);
        },

        /**
         * global对象，在浏览器环境中为window
         * @type {Object}
         */
        global: global,

        /**
         * 空函数，在需要使用空函数作为参数时使用
         */
        noop: noop,

        Config: {
            debug: location.search.indexOf("debug") !== -1 ? true : false,
            fns: {}
        },

        config: function(name, value) {
            var self = S,
                Config = self.Config,
                fns = Config.fns,
                cfg,
                ret;

            if (typeof name === "string") {
                cfg = fns[name];
                // get config
                if (value === undefined) {
                    ret = cfg ? cfg.call(self) : Config[name];
                } else { // set config
                    if (cfg) {
                        ret = cfg.call(self, value);
                    } else {
                        Config[name] = value;
                    }
                }
            } else {
                // Object Config
                S.each(name, function(v, k) {
                    var fn = fns[k];
                    if (fn) {
                        fn.call(self, v);
                    } else {
                        Config[k] = v;
                    }
                });
            }
            return ret;
        },

        mix: mix

    });

    /*
     * simple mix
     */
    function mix(to, from) {
        if (!from) {
            from = to;
            to = S;
        }
        for (var i in from) {
            to[i] = from[i];
        }
        return to;
    }

})(this, "tbtx");
