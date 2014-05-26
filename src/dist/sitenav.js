/**
 * 淘宝吊顶
 */

define("dist/TB", ["http://g.tbcdn.cn/tb/global/2.6.10/global-min.css", this.KISSY ? "http://g.tbcdn.cn/tb/global/2.6.10/global-min.js" : "http://g.tbcdn.cn/??kissy/k/1.3.2/kissy-min.js,tb/global/2.6.10/global-min.js"], function() {

});

define("dist/sitenav", ["jquery", "./TB"], function($) {
    var S = tbtx,
        global = S.global;

    var template = '<div id="J_SiteNav" class="site-nav"><div id="J_SiteNavBd" class="site-nav-bd"><ul id="J_SiteNavBdL" class="site-nav-bd-l"></ul><ul id="J_SiteNavBdR" class="site-nav-bd-r"></ul></div></div>';
    var sitenav = $(template).prependTo('body');

    // 干掉淘宝登陆与购物车
    TB.Global.ui = {
        l: []
    };
    TB.Global.blacklist = ["fn-cart"];
    TB.Global.init();

    return {
        render: function(isLogin, context) {
            $(this.container).html(S.substitute(isLogin ? this.logined : this.notLogined, context));
        },
        container: "#J_SiteNavBdL",
        logined: '<div id="J_LoginInfo" class="menu"><div id="J_LoginInfoHd" class="menu-hd"><a href="{{ userUrl }}" target="_blank">{{ userName }}</a><a href="{{ logoutUrl }}">退出</a></div></div>',
        notLogined: '<div id="J_LoginInfo" class="menu"><div id="J_LoginInfoHd" class="menu-hd"><a href="{{ loginUrl }}">亲，请登录</a></div></div>'
    };
});