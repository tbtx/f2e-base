(function(global, $) {

    var miieeJSToken = function() {
        var token = Math.random().toString().substr(2) + (new Date()).getTime().toString().substr(1) + Math.random().toString().substr(2);
        tbtx.cookie.set('MIIEE_JTOKEN', token, '', '', '/');
        return token;
    };

    var userCheckAjax;
    // 默认使用登陆接口，某些操作使用临时登陆状态即可
    var userCheck = function(callSuccess, callFailed, isTemp) {
        userCheckAjax = userCheckAjax || $.ajax({
            type: "POST",
            url: isTemp ?  tbtx.path.getlogininfo : tbtx.path.getuserinfo,
            dataType: 'json',
            data: {},
            timeout: 5000
        }).done(function(json) {
            if (json.result && json.result.data) {
                tbtx.data('user', json.result.data);
            }
        });

        userCheckAjax.done(function(json) {
            var code = json.code;
            if (code == 601) {
                callFailed();
            } else if (code == 100 || code == 608 || code == 1000) {
                callSuccess();
            }
        }).fail(callFailed);
    };

    var config = {
        miiee: {
            appkey: "2328604005",
            uid: "1644022571"       // 实际上该uid为tbtx
        },
        brand: {
            appkey: "2328604005",       // 暂时使用miiee的appkey
            uid: "2140361617"
        },
        tbtx: {
            uid: "1644022571"
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
            appkey: config[site].appkey, // appkey
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
            alert('按下 ' + (navigator.userAgent.toLowerCase().indexOf('mac') != -1 ? 'Command/Cmd' : 'CTRL') + ' + D 来收藏本页.');
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


    tbtx.mix({
        miieeJSToken: miieeJSToken,
        userCheck: userCheck,

        shareToSinaWB: shareToSinaWB,
        addToFavourite: addToFavourite
    });
})(this, jQuery);
