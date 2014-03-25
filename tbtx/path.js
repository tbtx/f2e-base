(function(S) {
    var parseResult = S.parseUrl();
    parseResult.query = new S.Query(parseResult.query).get();
    S.data("urlInfo", parseResult);

    var Root = parseResult.scheme + "://" + parseResult.domain;
    if (parseResult.port) {
        Root += ":" + parseResult.port;
    }
    if (!S.startsWith(parseResult.scheme, "http")) {
        Root = '';
    }

    var path = {
        getuserinfo: '/interface/getuserinfo.htm',
        getlogininfo: '/interface/getlogininfo.htm',       // 临时登陆状态判断
        taobao_login_page : '/applogin.htm',
        login: '/applogin.htm?ref=' + encodeURIComponent(location.href)
    };

    S.mix({
        Root: Root,
        path: path
    });
})(tbtx);
