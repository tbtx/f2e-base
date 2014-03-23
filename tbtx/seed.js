(function(global, S) {

    var cidCounter = 0;

    S = global[S] = global[S] || {};

    mix(S, {

        /**
         * 在log环境下输出log信息，避免因为忘记删除log语句而引发错误
         * @param  {string} msg 消息
         * @param  {string} cat 类型，如error/info等，可选
         * @param  {string} src 消息来源，可选
         * @return {object}     返回tbtx以链式调用，如tbtx.log().log()
         */
        log: function(msg, cat, src) {
            if (src) {
                msg = src + ': ' + msg;
            }
            if (global['console'] !== undefined && console.log) {
                console[cat && console[cat] ? cat : 'log'](msg);
            }
            return this;
        },

        /**
         * staticUrl 默认静态文件url前缀
         * 会在后面根据实际的地址重写，这里作为备用
         * @type {String}
         */
        staticUrl: "http://static.tianxia.taobao.com/tbtx/",

        /**
         * global对象，在浏览器环境中为window
         * @type {object}
         */
        global: global,

        /**
         * 空函数，在需要使用空函数作为参数时使用
         */
        noop: function() {},

        _config: {},

        config: function(k, v) {
            var config = this._config;
            if (S.isPlainObject(k)) {
                S.mix(config, k);
            } else if (S.isString(k)) {
                config[k] = v;
            }
            return this;
        },

        /**
         * client unique id
         * @return {number} cid
         */
        uniqueCid: function() {
            return cidCounter++;
        },

        $: global.jQuery || global.Zepto

    });

    function mix(des, source) {
        var i;

        for (i in source) {
            des[i] = source[i];
        }
        return des;
    }

})(this, 'tbtx');
