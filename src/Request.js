define("request", ["jquery"], function($) {
    var S = tbtx,
        cookie = S.cookie;

    var generateToken = function(name) {
        var token = Math.random().toString().substr(2) + (new Date()).getTime().toString().substr(1) + Math.random().toString().substr(2);
        cookie.set(S.tokenName, token, '', '', '/');
        return token;
    };
    // 默认蜜儿
    S.tokenName = 'MIIEE_JTOKEN';

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
            successCode = successCode || Request.successCode || [100];
            data = data || {};
            if (S.isPlainObject(data) && !data.jtoken) {
                data.jtoken = generateToken();
            }

            var deferred = requestMap[url];
            // 正在处理中
            if (deferred && deferred.state() === "pending") {
                deferred.notify(requestingCode);
                return deferred.promise();
            }

            deferred = requestMap[url] = $.Deferred();
            $.ajax({
                url: url,
                type: 'post',
                dataType: 'json',
                data: data,
                timeout: 10000
            })
            .done(function(response) {
                var code = response && response.code;
                if (S.inArray(successCode, code)) {
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