
var randomToken = function() {
        return Math.random().toString(36).substring(2, 15);
    },

    // 互斥锁
    isTokenLock = 0,

    token = randomToken() + randomToken(),

    generateToken = function() {
        cookie.set(_config("tokenName"), token, "", "", "/");
        return token;
    };

// 默认蜜儿
_config({
    tokenName: "MIIEE_JTOKEN",

    request: {
        code: {
            fail: -1,
            success: 100
        },
        msg: {
            def: "请求失败！请重试！",
            0: "无法连接到服务器！请检查网络连接！",
            500: "服务器出错!",
            timeout: "请求超时！",
            abort: "请求被终止！",
            parsererror: "服务器出错或数据解析出错！"
        }
    }
});

S.generateToken = generateToken;

define("request", ["jquery"], function($) {

    var config = _config("request"),
        code = config.code,
        msg = config.msg,

        /**
         * 解决后端删除jtoken后ajax cookie没有token
         * 每次同时只处理一个request 请求
         */
        send = function(options, successCode, defer) {
            if (isTokenLock) {
                setTimeout(function() {
                    send(options, successCode, defer);
                }, 50);
                return false;
            }

            isTokenLock = 1;
            options.data.jtoken = generateToken();
            $.ajax(options)
            .done(function(response) {
                var code, result;
                if (response) {
                    code = response.code;
                    result = response.result;

                    // 有result返回result，没有result返回response
                    // 返回result时加一层result来兼容之前的写法
                    if (result) {
                        result.code = code;
                        result.msg = response.msg;
                        result.result = extend(true, isArray(result) ? [] : {}, result);

                        response = result;
                    }
                }

                if (code === successCode) {
                    defer.resolve(response, options);
                } else {
                    defer.reject(code, response, options);
                }
            })
            .fail(function(xhr, status, err) {
                defer.reject(code.fail, {
                    code: code.fail,
                    url: url,
                    msg: msg[xhr.status] || msg[status] || msg.def
                });
            })
            .always(function() {
                isTokenLock = 0;
            });
        },

        request = function(url, data, successCode) {
            var ret = $.Deferred(),
                options = {
                    method: "post",
                    dataType: "json",
                    timeout: 10000
                };

            if (typeof url === "object") {
                options = extend(options, url);
                successCode = data;
            } else {
                extend(options, {
                    url: url,
                    data: data
                });
            }

            successCode = successCode || code.success;
            data = options.data || {};
            url = S.addQueryParam(options.url.trim(), "_", Date.now());
            if (isString(data)) {
                data = unparam(data);
            }

            options.url = url;
            options.data = data;

            send(options, successCode, ret);
            return ret;
        };

    return request;
});