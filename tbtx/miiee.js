(function(T) {
    var miieeJSToken = function() {
        var token = Math.random().toString().substr(2) + (new Date()).getTime().toString().substr(1) + Math.random().toString().substr(2);
        T.cookie.set('MIIEE_JTOKEN', token, '', '', '/');
        return token;
    };

    var userCheckAjax;
    var userCheck = function(callSuccess, callFailed) {
        userCheckAjax = userCheckAjax || $.ajax({
            type: "POST",
            url: T.path.getuserinfo,
            dataType: 'json',
            data: {},
            timeout: 5000
        }).done(function(json) {
            if (json.result && json.result.data) {
                T.data('user', json.result.data);
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
            appkey: "2328604005"
        },
        tbtx: {
            uid: "1644022571"
        }
    };

    var shareToSinaWB = function(selecotr, title, url, pic) {
        if (!pic) {
            pic = '';
        }
        if (!url) {
            url = window.location.href;
        }

        var base = 'http://v.t.sina.com.cn/share/share.php?';
        var params = {
            appkey: config.miiee.appkey, // appkey
            url: url,
            title: title,
            ralateUid: config.tbtx.uid, // @user
            pic: pic
        };

        var link = base + $.param(params);
        $(selecotr).attr({
            href: link,
            target: "_blank"
        });
    };

    var addToFavourite = function(title, url) {
        var title = title || document.title,
            url = url || document.location.href;

        var def = function() {
            alert('按下 ' + (navigator.userAgent.toLowerCase().indexOf('mac') != -1 ? 'Command/Cmd' : 'CTRL') + ' + D 来收藏本页.');
        };

        try {
            // Internet Explorer 
            window.external.AddFavorite(url, title);
        } catch (ex) {
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


    T.mix(T, {
        miieeJSToken: miieeJSToken,
        userCheck: userCheck,

        shareToSinaWB: shareToSinaWB,
        addToFavourite: addToFavourite
    });
})(tbtx);
