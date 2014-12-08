
var REQUEST_CONFIG = "request.config";

define(REQUEST_CONFIG, function() {

    var random = function() {
            return Math.random().toString(36).substring(2, 15);
        },

        token = random() + random(),

        generateToken = function() {
            cookie.set(_config("tokenName"), token, "", new Date(Date.now() + 10000), "/");
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

    return generateToken;
});

require(REQUEST_CONFIG);

define("request", ["jquery", REQUEST_CONFIG], function($, generateToken) {

    var config = _config("request"),
        code = config.code,
        msg = config.msg,

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

            data.jtoken = generateToken();
            options.url = url;
            options.data = data;

            $.ajax(options).done(function(response) {
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
                    ret.resolve(response, options);
                } else {
                    ret.reject(code, response, options);
                }
            }).fail(function(xhr, status, err) {
                ret.reject(code.fail, {
                    code: code.fail,
                    url: url,
                    msg: msg[xhr.status] || msg[status] || msg.def
                });
            });

            return ret;
        };

    return request;
});