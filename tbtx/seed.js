(function(global, S) {

    var isSupportConsole = global['console'] && console.log,
        noop = function() {},

        // 生成 cid生成器
        generateCid = function(prefix) {
            var counter = 0;
            prefix = prefix && String(prefix);
            return function() {
                var ret = prefix ? prefix + counter : counter;
                counter++;
                return ret;
            };
        };

    S = global[S] = global[S] || {};

    mix(S, {

        /**
         * 在log环境下输出log信息，避免因为忘记删除log语句而引发错误
         * @param  {string} msg 消息
         * @param  {string} cat 类型，如error/info等，可选
         * @param  {string} src 消息来源，可选
         * @return {object}     返回tbtx以链式调用，如tbtx.log().log()
         */
        log: isSupportConsole ? function(msg, cat, src) {
            if (src) {
                msg = src + ': ' + msg;
            }
            console[cat && console[cat] ? cat : 'log'](msg);
            return this;
        } : noop,

        /**
         * staticUrl 默认静态文件url前缀
         * 会在后面根据实际的地址重写，这里作为备用
         * @type {String}
         */
        staticUrl: 'http://static.tianxia.taobao.com/tbtx/',

        /**
         * global对象，在浏览器环境中为window
         * @type {object}
         */
        global: global,

        /**
         * 空函数，在需要使用空函数作为参数时使用
         */
        noop: noop,

        // Config: {},

        // config: function(name, value) {
        //     var Config = S.Config;

        //     if (typeof name === 'string') {
        //         Config[name] = value;
        //     } else {
        //         // object
        //         mix(Config, name);
        //     }

        //     return S;
        // },

        /**
         * client unique id
         * @return {number} cid
         */
        uniqueCid: generateCid(),

        generateCid: generateCid,

        $: global.jQuery

    });

    function mix(des, source) {
        for (var i in source) {
            des[i] = source[i];
        }
    }

})(this, 'tbtx');
