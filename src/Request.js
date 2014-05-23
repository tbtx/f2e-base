define("request", ["jquery"], function($) {
    var S = tbtx,
        cookie = S.cookie,
        isPlainObject = S.isPlainObject;

    var generateToken = function() {
        var token = Math.random().toString().substr(2) + Date.now().toString().substr(1) + Math.random().toString().substr(2);
        cookie.set(S.tokenName, token, '', '', '/');
        return token;
    };
    // 默认蜜儿
    S.tokenName = "MIIEE_JTOKEN";

    var requestFailCode = -1,
        requestFailResponse = {
            code: requestFailCode,
            msg: "请求失败！请检查网络连接！"
        },
        requestingCode = -2,
        requestMap = {},
        /**
         * 适用于用到jtoken的请求
         */
        request = function(url, data, successCode) {
            var config;

            if (isPlainObject(url)) {
                config = url;
                successCode = data;
            } else {
                data = data || {};
                if (isPlainObject(data) && !data.jtoken) {
                    data.jtoken = generateToken();
                }
                config = {
                    url: url,
                    data: data,
                    type: "post",
                    dataType: "json",
                    timeout: 10000
                };
            }

            successCode = successCode || 100;

            var deferred = requestMap[url];
            // 正在处理中
            if (deferred && deferred.state() === "pending") {
                deferred.notify(requestingCode);
                return deferred.promise();
            }

            deferred = requestMap[url] = $.Deferred();
            $.ajax(config)
            .done(function(response) {
                var code = response && response.code;
                if (code === successCode) {
                    deferred.resolve(response);
                } else {
                    deferred.reject(code, response);
                }
            })
            .fail(function() {
                deferred.reject(requestFailCode, requestFailResponse);
            });

            return deferred.promise();
        };

    // 大写兼容之前的用法
    S.Request = S.request = request;

    return request;
});