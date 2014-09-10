define("request", ["jquery", "json"], function($) {

    var S = tbtx,
        cookie = S.cookie,
        isPlainObject = S.isPlainObject,
        config = S.config,
        key = "tokenName",

        random = function() {
            return String(Math.random()).slice(2);
        },
        token = random() + random() + random(),
        generateToken = function() {
            cookie.set(config(key), token, "", "", "/");
            return token;
        };

    if (!config(key)) {
        // 默认蜜儿
        config(key, "MIIEE_JTOKEN");
    }

    config({
        requestFailCode: -1,
        // 正在请求中，state === "pending"
        requestingCode: -2,
        // 请求成功
        requestSuccessCode: 100,

        requestFailMsg: {
            "def": "请求失败！请重试！",
            "0": "无法连接到服务器！",
            // "301": "请求被重定向!",
            // "302": "请求被临时重定向！",
            "500": "服务器出错!",
            "timeout": "请求超时！请检查网络连接！",
            // "abort": "请求被终止！",
            "parsererror": "服务器出错或数据解析出错！"
        }
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

                if (!isPlainObject(data)) {
                    data = S.unparam(data);
                }

                settings.url = url;
                settings.data = data;
            }

            // 做个trim防止出错
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

            data.jtoken = generateToken();

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
            .fail(function(xhr, status, err) {
                var msgs = config("requestFailMsg");

                deferred.reject(config("requestFailCode"), {
                    code: config("requestFailCode"),
                    url: url,
                    msg: msgs[xhr.status] || msgs[status] || msgs.def
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