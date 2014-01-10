(function(global, S) {

    var cidCounter = 0;

    S = global[S] = {

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
         * staticUrl 默认静态文件url前缀
         * 会在后面根据实际的地址重写，这里作为备用
         * @type {String}
         */
        staticUrl: "http://static.tianxia.taobao.com/tbtx",

        /**
         * global对象，在浏览器环境中为window
         * @type {object}
         */
        global: global,

        _tbtx: global[S],

        /**
         * 空函数，在需要使用空函数作为参数时使用
         */
        noop: function() {},

        /**
         * client unique id
         * @return {number} cid
         */
        uniqueCid: function() {
            return cidCounter++;
        },

        Cache: Cache

    };

    function Cache(namespace) {
        this.namespace = namespace || "";
        this.cache = {};
    }

    Cache.prototype = {

        set: function(key, val) {
            if (val === undefined) {
                return this.get(key);
            }

            key = this.parseKey(key);
            this.cache[key] = val;
            return val;
        },

        get: function(key) {
            key = this.parseKey(key);
            return this.cache[key];
        },

        getAll: function() {
            // return a copy
            return S.deepCopy(this.cache);
        },

        remove: function(key) {
            key = this.parseKey(key);
            delete this.cache[key];
            return this;
        },

        clear: function() {
            delete this.cache;
            this.cache = {};
        },

        parseKey: function(key) {
            key = String(key);
            if (this.namespace) {
                key = this.namespace + ":" + key;
            }
            return key;
        }

    };

    var dataCache = new Cache("data");

    /**
     * 存取数据
     * @param  {string} key   键值
     * @param  {any} value 存放值
     */
    S.data = function(key, value) {
        return dataCache.set(key, value);
    };
    S.removeData = function(key) {
        dataCache.remove(key);
        return this;
    };

})(this, 'tbtx');
