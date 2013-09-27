(function(global, tbtx) {

    global[tbtx] = {

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

        /*
         * debug mod off
         */
        debug: false,

        /**
         * global对象，在浏览器环境中为window
         * @type {object}
         */
        global: global,

        /**
         * 存放数据
         * @type {Object}
         */
        _data: {},

        /**
         * 存取数据
         * @param  {string} key   键值
         * @param  {any} value 存放值
         */
        data: function(key, value) {
            var self = this;
            var ret;

            if (!key && !value) {
                return ret;
            }

            if (typeof key == 'string') {
                if (value) {
                    self._data[key] = value;
                    return self;
                } else {
                    return self._data[key];
                }
            }
            return ret;
        },

        /**
         * 空函数，在需要使用空函数作为参数时使用
         */
        noop: function() {}
    };

})(this, 'tbtx');
