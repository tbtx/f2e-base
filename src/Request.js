define("request", ["jquery"], function($) {
    var S = tbtx,
        cookie = S.cookie,
        isPlainObject = S.isPlainObject,
        config = S.config;

    var generateToken = S.generateToken = function() {
        var token = Math.random().toString().substr(2) + Date.now().toString().substr(1) + Math.random().toString().substr(2);
        cookie.set(config("tokenName"), token, '', '', '/');
        return token;
    };

    if (!config("tokenName")) {
        // 默认蜜儿
        config("tokenName", "MIIEE_JTOKEN");
    }

    config({
        requestFailCode: -1,
        requestFailMsg: "请求失败！请检查网络连接！",

        // 正在请求中，state === "pending"
        requestingCode: -2,
        requestSuccessCode: 100
    });

    var deferredMap = {},

        request = function(url, data, successCode) {
            var settings;

            if (isPlainObject(url)) {
                settings = url;
                successCode = data;
                url = settings.url;
                data = settings.data;
            } else {
                data = data || {};
                settings = {
                    url: url,
                    data: data,
                    type: "post",
                    dataType: "json",
                    timeout: 10000
                };
            }
            if (isPlainObject(data) && !data.jtoken) {
                data.jtoken = generateToken();
            }

            successCode = successCode || config("requestSuccessCode");

            var deferred = deferredMap[url];
            // 正在处理中
            if (deferred && deferred.state() === "pending") {
                deferred.notify(config("requestingCode"));
                return deferred.promise();
            }

            deferred = deferredMap[url] = $.Deferred();

            $.ajax(settings)
            .done(function(response) {
                var code = response && response.code;
                if (code === successCode) {
                    // 有result返回result，没有result返回response
                    // 返回result时加一层result来兼容之前的写法
                    if (response.result) {
                        response = response.result;
                        response.result = S.extend({}, response);
                    }
                    deferred.resolve(response);
                } else {
                    deferred.reject(code, response);
                }
            })
            .fail(function() {
                deferred.reject(config("requestFailCode"), {
                    code: config("requestFailCode"),
                    msg: config("requestFailMsg")
                });
            });

            return deferred.promise();
        };

    // 大写兼容之前的用法
    S.Request = S.request = request;

    return request;
});