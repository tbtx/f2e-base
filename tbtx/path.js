(function(T) {
    var location = document.location;

    var ROOT = (function() {
        var ret = location.protocol + '//' + location.hostname;
        if (location.port) {
            ret += ':' + location.port;
        }
        return ret;
    }()).toString();

    if (!(/^http/i).test(ROOT)) {
        ROOT = '';
    }

    var baseUrl = ROOT + '/';

    var path = {
        getuserinfo:  baseUrl + 'interface/getuserinfo.htm',
        taobao_login_page : baseUrl + 'applogin.htm'
    };


    T.mix(T, {
        ROOT: ROOT,
        path: path
    });
})(tbtx);
