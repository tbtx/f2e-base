(function(S) {
    var parseResult = S.parseUrl(location.href);
    S.data("urlInfo", parseResult);

    var ROOT = parseResult.scheme + "://" + parseResult.domain;
    if (parseResult.port) {
        ROOT += ":" + parseResult.port;
    }

    if (!(/^http/i).test(ROOT)) {
        ROOT = '';
    }

    var path = {
        getuserinfo: '/interface/getuserinfo.htm',
        getlogininfo: '/interface/getlogininfo.htm',       // 临时登陆状态判断
        taobao_login_page : '/applogin.htm',
        login: '/applogin.htm?ref=' + encodeURIComponent(location.href)
    };


    S.mix({
        ROOT: ROOT,
        path: path
    });
})(tbtx);
