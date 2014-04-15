(function(global, S) {

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
                msg = src + ': ' + msg;
            }
            console[cat && console[cat] ? cat : "log"](msg);

            return this;
        } : noop,

        /**
         * global对象，在浏览器环境中为window
         * @type {Object}
         */
        global: global,

        /**
         * 空函数，在需要使用空函数作为参数时使用
         */
        noop: noop

    });

    function mix(des, source) {
        for (var i in source) {
            des[i] = source[i];
        }
    }

})(this, 'tbtx');
