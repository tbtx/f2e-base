define("request", ["jquery"], function($) {
    var S = tbtx,
        cookie = S.cookie;

    var generateToken = function() {
        var token = Math.random().toString().substr(2) + (new Date()).getTime().toString().substr(1) + Math.random().toString().substr(2);
        cookie.set(S.config("tokenName"), token, '', '', '/');
        return token;
    };
    // 默认蜜儿
    S.config("tokenName", "MIIEE_JTOKEN");

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
        Request = function(url, data, successCode) {
            var config;

            if (S.isPlainObject(url)) {
                config = url;
                successCode = data;
            } else {
                data = data || {};
                if (S.isPlainObject(data) && !data.jtoken) {
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

    S.Request = Request;
    return Request;
});