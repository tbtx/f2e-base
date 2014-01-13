(function(S) {

    function Cache(name) {
        this.name = name || "";
        this.cid = S.uniqueCid();
        this.cache = {};
    }

    Cache.prototype = {

        set: function(key, val) {
            this.cache[key] = val;
            return val;
        },

        get: function(key) {
            return key === undefined ? this.getAll() : this.cache[key];
        },

        getAll: function() {
            // return a copy
            return S.deepCopy(this.cache);
        },

        remove: function(key) {
            delete this.cache[key];
            return this;
        },

        clear: function() {
            delete this.cache;
            this.cache = {};
        }

    };

    var dataCache = new Cache("data");

    /**
     * 存取数据
     * @param  {string} key   键值
     * @param  {any} value 存放值
     */
    S.data = function(key, value) {
        return value === undefined ? dataCache.get(key) : dataCache.set(key, value);
    };
    S.removeData = function(key) {
        dataCache.remove(key);
        return this;
    };

    S.Cache = Cache;
})(tbtx);