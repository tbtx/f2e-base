(function(global) {
    var location = document.location;

    var ROOT = location.protocol + '//' + location.host;

    if (!(/^http/i).test(ROOT)) {
        ROOT = '';
    }

    var baseUrl = ROOT + '/';

    var path = {
        getuserinfo:  baseUrl + 'interface/getuserinfo.htm',
        getlogininfo: baseUrl + 'interface/getlogininfo.htm',       // 临时登陆状态判断
        taobao_login_page : baseUrl + 'applogin.htm',
        login: baseUrl + 'applogin.htm'+ "?ref=" + encodeURIComponent(location.href)
    };


    tbtx.mix({
        ROOT: ROOT,
        path: path
    });
})(this);
