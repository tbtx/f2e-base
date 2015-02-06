
var location = global.location,

    ua = navigator.userAgent,

    documentElement = document.documentElement,

    head = document.head || document.getElementsByTagName("head")[0],

    noop = function() {},

    error = function (msg) {
        throw isError(msg) ? msg : new Error(msg);
    },

    /**
     * 配置对象
     * @type {Object}
     */
    Config = {
        debug: location.search.indexOf("debug") !== -1 ? true : false
    },

    _config = function(key, value) {
        var ret = S;

        if (isString(key)) {
            // get config
            if (value === undefined) {
                ret = Config[key];
            } else { // set config
                Config[key] = value;
            }
        } else {
            // Object config
            each(key, function(v, k) {
                Config[k] = v;
            });
        }

        return ret;
    };

S = global[S] = {

    version: "2.5",

    /**
     * 在log环境下输出log信息，避免因为忘记删除log语句而引发错误
     * @param  {String} msg 消息
     * @param  {String} src 消息来源，可选
     * @return {Object}     返回this以链式调用，如S.log().log()
     */
    log: noop,

    /**
     * Throws error message.
     */
    error: error,

    /**
     * global对象，在浏览器环境中为window
     * @type {Object}
     */
    global: global,

    /**
     * 空函数，在需要使用空函数作为参数时使用
     */
    noop: noop,

    Config: Config,

    config: _config
};