define("request", ["jquery", "json"], function($) {
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
        requestData = {},

        request = function(url, data, successCode, nocache) {
            var settings = {
                type: "post",
                dataType: "json",
                timeout: 10000
            };

            if (isPlainObject(url)) {
                settings = S.extend(settings, url);
                nocache = successCode;
                successCode = data;
            } else {
                data = data || {};
                settings.url = url;
                settings.data = data;
            }

            url = settings.url.trim();
            data = settings.data;
            if (typeof successCode === "boolean") {
                nocache = successCode;
                successCode = 0;
            }
            successCode = successCode || config("requestSuccessCode");


            var deferred = deferredMap[url];
            if (!nocache && deferred && deferred.state() === "pending") {
                if (isEqual(data, requestData[url])) {
                    deferred.notify(config("requestingCode"));
                    return deferred.promise();
                }
            }


            deferred = deferredMap[url] = $.Deferred();
            requestData[url] = data;

            if (isPlainObject(data) && !data.jtoken) {
                data.jtoken = generateToken();
            }
            // url 加上时间戳
            settings.url = S.addQueryParam(url, "_", String(Math.random()).replace(/\D/g, ""));

            $.ajax(settings)
            .done(function(response) {
                var code, result;
                if (response) {
                    code = response.code;
                    result = response.result;
                }

                if (code === successCode) {
                    // 有result返回result，没有result返回response
                    // 返回result时加一层result来兼容之前的写法
                    if (result) {
                        response = result;
                        response.result = S.extend(Array.isArray(response) ? [] : {}, response);
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


    function isEqual(a, b) {
        return JSON.stringify(a) == JSON.stringify(b);
    }

    return request;
});