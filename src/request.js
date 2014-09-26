
define("request.config", function() {

    var key = "tokenName",

        random = function() {
            return String(Math.random()).slice(2);
        },

        token = random() + random() + random(),

        generateToken = function() {
            cookie.set(S.config(key), token, "", "", "/");
            return token;
        };

    // 默认蜜儿
    S.config(key, "MIIEE_JTOKEN");

    S.config({
        request: {
            code: {
                fail: -1,
                success: 100,
                pending: -2
            },
            msg: {
                def: "请求失败！请重试！",
                0: "无法连接到服务器！",
                // "301": "请求被重定向!",
                // "302": "请求被临时重定向！",
                500: "服务器出错!",
                timeout: "请求超时！请检查网络连接！",
                // "abort": "请求被终止！",
                parsererror: "服务器出错或数据解析出错！"
            }
        }
    });

    S.generateToken = generateToken;
});

require("request.config");

define("request", ["jquery"], function($) {

    /**
     * 拦截器
     * @type {Array}
     */
    var interceptors = [];

});