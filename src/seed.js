(function(global, S, undefined) {

    var isSupportConsole = global.console && console.log,
        noop = function() {};

    S = global[S] = {

        version: "2.0",

        /**
         * 在log环境下输出log信息，避免因为忘记删除log语句而引发错误
         * @param  {String} msg 消息
         * @param  {String} src 消息来源，可选
         * @return {Object}     返回this以链式调用，如S.log().log()
         */
        log: isSupportConsole ? function(msg, src) {
            if (S.config("debug")) {
                if (src) {
                    msg = src + ": " + msg;
                }
                console.log(msg);
            }

            return S;
        } : noop,

        /**
         * Throws error message.
         */
        error: function (msg) {
            throw S.isError(msg) ? msg : new Error(msg);
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

        /**
         * 配置对象
         * @type {Object}
         */
        Config: {
            debug: location.search.indexOf("debug") !== -1 ? true : false,
            fns: {}
        },

        config: function(key, value) {
            var self = S,
                Config = self.Config,
                fns = Config.fns,
                fn,
                ret = self;

            if (typeof key === "string") {
                fn = fns[key];
                // get config
                if (value === undefined) {
                    ret = fn ? fn.call(self) : Config[key];
                } else { // set config
                    if (fn) {
                        ret = fn.call(self, value);
                    } else {
                        Config[key] = value;
                    }
                }
            } else {
                // Object Config
                S.each(key, function(v, k) {
                    fn = fns[k];
                    if (fn) {
                        fn.call(self, v);
                    } else {
                        Config[k] = v;
                    }
                });
            }

            return ret;
        }
    };

})(this, "tbtx");
