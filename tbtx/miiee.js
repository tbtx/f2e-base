(function(S) {
    var $ = S.$,
        isPending = S.isPending,
        PATH = S.path,
        TIMEOUT = 10000;

    // cookie写入JSToken，服务器端处理后清掉，如果url的token跟cookie的不对应则
    // 参数非法，防止重复提交
    var miieeJSToken = function() {
        var token = Math.random().toString().substr(2) + (new Date()).getTime().toString().substr(1) + Math.random().toString().substr(2);
        S.cookie.set('MIIEE_JTOKEN', token, '', '', '/');
        return token;
    };

    // 临时跟真正登陆暂时没区分
    var userCheckDeferred;
    // 默认使用登陆接口，某些操作使用临时登陆状态即可
    var userCheck = function(callSuccess, callFailed, isTemp) {
        if (userCheckDeferred) {
            return userCheckDeferred.done(callSuccess).fail(callFailed);
        }
        userCheckDeferred = $.Deferred();
        $.ajax({
            type: "POST",
            url: isTemp ?  PATH.getlogininfo : PATH.getuserinfo,
            dataType: 'json',
            data: {},
            timeout: TIMEOUT
        }).done(function(response) {
            var data = response.result && response.result.data,
                code = response.code;

            if (code == 601) {
                userCheckDeferred.reject();
            } else if (S.inArray([100, 608, 1000], code)) {
                S.data('user', data);
                S.data('userName', data.trueName ? data.trueName : data.userNick);
                userCheckDeferred.resolve(data);
            }
        }).fail(function() {
            userCheckDeferred.reject();
        });

        userCheckDeferred.done(callSuccess).fail(callFailed).fail(function() {
            // J-login 链接改为登陆
            $('.J-login').attr({
                href: PATH.login,
                target: "_self"
            });
        });
        return userCheckDeferred.promise();
    };


    var config = {
        miiee: {
            appkey: "2328604005",
            uid: "1644022571"       // 实际上该uid为tbtx, miiee2690564321
        },
        brand: {
            appkey: "2328604005",       // 暂时使用miiee的appkey
            uid: "2140361617"
        },
        tbtx: {
            appkey: "2328604005",
            uid: "1644022571"
        },
        maijia: {
            uid: "1771650130"
        }
    };
    var shareToSinaWB = function(selecotr, title, url, pic, site, uid) {
        uid = uid || '';
        site = site || "miiee";
        pic = pic || '';
        url = url || window.location.href;
        title = title || $('meta[name="description"]').attr("content");

        var base = 'http://v.t.sina.com.cn/share/share.php?';
        var params = {
            appkey: config[site].appkey || "", // appkey
            url: url,
            title: title,
            ralateUid: uid || config[site].uid, // @user
            pic: pic
        };

        var link = base + $.param(params);
        $(selecotr).attr({
            href: link,
            target: "_blank"
        });
    };

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
            if (typeof data === "object" && !data.jtoken) {
                data.jtoken = miieeJSToken();
            }

            var deferred = requestMap[url];
            // 正在处理中
            if (deferred && isPending(deferred)) {
                deferred.notify(requestingCode);
                return deferred.promise();
            }

            deferred = requestMap[url] = $.Deferred();
            $.ajax({
                url: url,
                type: 'post',
                dataType: 'json',
                data: data,
                timeout: TIMEOUT
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

    S.mix({
        miieeJSToken: miieeJSToken,
        userCheck: userCheck,

        initMiiee: function() {
            return S.loadScript(["miiee/js/m.js", "miiee/js/base.js"]);
        },

        Request: Request,

        /**
         * 概率选中, 用于概率执行某操作
         * 从1开始记
         * 如70%的概率则为 bingoRange 70, range 100 or 7-10
         * @param  {number} bingoRange 选中的范围
         * @param  {number} range      总范围
         * @return {boolean}           是否中
         */
        bingo: function(bingoRange, range) {
            if (bingoRange > range) {
                return false;
            }
            range = range || 100;

            var seed = S.choice(1, range + 1);
            if (seed <= bingoRange) {
                return true;
            } else {
                return false;
            }
        },

        shareToSinaWB: shareToSinaWB,

        addToFavourite: function(title, url) {
            url = url || document.location.href;
            title = title || document.title;

            var def = function() {
                S.MSG.info('按下 ' + (navigator.userAgent.toLowerCase().indexOf('mac') != -1 ? 'Command/Cmd' : 'CTRL') + ' + D 来收藏本页.');
            };

            try {
                // Internet Explorer
                window.external.AddFavorite(url, title);
            } catch (e) {       // 两个e不要一样
                try {
                    // Mozilla
                    window.sidebar.addPanel(title, url, "");
                } catch (ex) {
                    // Opera
                    // 果断无视opera
                    if (typeof(opera) == "object") {
                        def();
                        return true;
                    } else {
                        // Unknown
                        def();
                    }
                }
            }
        }
    });
})(tbtx);
