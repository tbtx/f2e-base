define("dist/tb-login", [], function() {
    var S = tbtx,
        cookie = S.cookie,
        unparam = S.unparam,
        win = window;

    var ret = {},
        // 路径配置
        path = {
            taobao: {
                logout: "http://login.taobao.com/member/logout.jhtml"
            },
            miiee: {
                login: "/applogin.htm",
                logout: "/logout.htm"
            }
        },
        // 获取站点
        site = S.config("site") || "miiee";

    /**
      * 登录判断
      * @return {Boolean}
      * _nk_     : 昵称
      * tracknick: 上次登录昵称
      * _l_g_    : 用户是否登录
      * lgc      : 初级域标识符
      */
    ret.isLogin = function() {
        var nick = cookie.get('_nk_') || cookie.get('tracknick'),
            login = cookie.get('_l_g_'),
            lgc = cookie.get('lgc');

        return !!(login && nick || lgc);
    };

    /**
     * 获取用户昵称
     * @param  {Boolean} encodeGBK
     * @return {String}
     */
    ret.getNick = function(encodeGBK) {
        var _nk_ = cookie.get('_nk_'),
            lgc = cookie.get('lgc'),
            nick = ret.fromUnicode(_nk_ || lgc);

        return !encodeGBK ? nick : ret.encodeGBK(nick).toLowerCase();
    };

    /**
     * 获取用户等级
     * @return {Number}
     */
    ret.getTag = function() {
        return parseInt(unparam(cookie.get('uc1'))['tag'], 10);
    };

    /**
     * Unicode 解码
     * @param  {String} str
     * @return {String}
     */
    ret.fromUnicode = function(str) {
        return str.replace(/\\u([a-f\d]{4})/ig, function(m, u) {
            return String.fromCharCode(parseInt(u, 16));
        });
    };

    /**
     * GBK 编码
     * @param  {String} str
     * @return {String}
     */
    ret.encodeGBK = function(str) {
        var img = doc.createElement('img');

        // 多字节字符编码
        function escapeDBC(str) {
            if (!str) return '';

            // IE 浏览器, 使用 vbscript 获取编码
            if (win.ActiveXObject) {
                execScript('SetLocale "zh-cn"', 'vbscript');
                return str.replace(/[\d\D]/g, function($0) {
                    win.vbsval = '';
                    execScript('window.vbsval=Hex(Asc("' + $0 + '"))', 'vbscript');
                    return '%' + win.vbsval.slice(0, 2) + '%' + win.vbsval.slice(-2);
                });
            }

            // W3C浏览器, 利用请求地址自动编码特性
            img.src = 'http://www.atpanel.com/jsclick?globaljs=1&separator=' + str;
            return img.src.split('&separator=').pop();
        }

        // 多字节字符使用 escapeDBC 函数编码
        // 单字节字符使用 encodeURIComponent 函数编码
        return str.replace(/([^\x00-\xff]+)|([\x00-\xff]+)/g, function($0, $1, $2) {
            return escapeDBC($1) + encodeURIComponent($2 || '');
        });
    };


    ret.logout = function(ref) {
        log(path.taobao.logout, function() {
            if (ref) {
                location.href = ref;
            } else {
                location.reload();
            }
        });
    };

    function log(url, callback) {
        // 防止请求被垃圾回收
        var image = new Image(),
            id = "_tbtx_" + Math.random();

        win[id] = image;
        image.onload = image.onerror = function() {
            win[id] = null;
            if (callback) {
                callback();
            }
        };
        image.src = url;
    }

    // 淘宝那边已经登陆
    // if (ret.isLogin()) {
    //     log(path[site].login, function() {
    //         S.trigger("taobao.login.loged");
    //     });
    // } else {
    //     log(path[site].logout);
    // }

    ret.log = log;
    return ret;
});
