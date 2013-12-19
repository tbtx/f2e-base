(function($, tbtx) {
    var isPending = tbtx.isPending;

    // cookie写入JSToken，服务器端处理后清掉，如果url的token跟cookie的不对应则
    // 参数非法，防止重复提交
    var miieeJSToken = function() {
        var token = Math.random().toString().substr(2) + (new Date()).getTime().toString().substr(1) + Math.random().toString().substr(2);
        tbtx.cookie.set('MIIEE_JTOKEN', token, '', '', '/');
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
            url: isTemp ?  tbtx.path.getlogininfo : tbtx.path.getuserinfo,
            dataType: 'json',
            data: {},
            timeout: 5000
        }).done(function(json) {
            var data = json.result && json.result.data,
                code = json.code;

            if (code == 601) {
                userCheckDeferred.reject();
            } else if (code == 100 || code == 608 || code == 1000) {
                tbtx.data('user', data);
                tbtx.data('userName', data.trueName ? data.trueName : data.userNick);
                userCheckDeferred.resolve(data);
            }
        }).fail(function() {
            userCheckDeferred.reject();
        });

        userCheckDeferred.done(callSuccess).fail(callFailed).fail(function() {
            // J-login 链接改为登陆
            $('.J-login').attr({
                href: tbtx.path.login,
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

    var addToFavourite = function(title, url) {
        url = url || document.location.href;
        title = title || document.title;

        var def = function() {
            tbtx.MSG.info('按下 ' + (navigator.userAgent.toLowerCase().indexOf('mac') != -1 ? 'Command/Cmd' : 'CTRL') + ' + D 来收藏本页.');
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
    };

    var requireFailCode = -1,
        successCode = 100,
        requestMap = {},

        Request = function(url, data) {
            data = data || {};
            if (!data.jtoken) {
                data.jtoken = miieeJSToken();
            }

            var deferred = requestMap[url];
            // 正在处理中
            if (deferred && isPending(deferred)) {
                return;
            }

            deferred = requestMap[url] = $.Deferred();
            $.ajax({
                url: url,
                type: 'post',
                dataType: 'json',
                data: data
            })
            .done(function(response) {
                var code = response && response.code;
                if (code == successCode) {
                    deferred.resolve(response);
                } else {
                    deferred.reject(code, response);
                }
            })
            .fail(function() {
                deferred.reject(requireFailCode);
            });

            return deferred.promise();
        };

    tbtx.mix({
        miieeJSToken: miieeJSToken,
        userCheck: userCheck,
        Request: Request,

        shareToSinaWB: shareToSinaWB,
        addToFavourite: addToFavourite
    });
})(jQuery, tbtx);
