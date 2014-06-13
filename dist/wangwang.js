/**
 * shiyi_tbtx
 * 旺旺点灯
 * <span data-role="wangwang" data-nick=""></span>
 */
define("dist/wangwang", ["jquery"], function($) {
    var S = tbtx;
    var template = '<a target="_blank" href="http://www.taobao.com/webww/ww.php?ver=3&touid={{ nick }}&siteid=cntaobao&status={{ s }}&charset=utf-8"><img border="0" src="http://amos.alicdn.com/realonline.aw?v=2&uid={{ nick }}&site=cntaobao&s={{ s }}&charset=utf-8" alt="{{ prompt }}" /></a>';

    var light = function(selector) {
        var elements = $(selector);

        elements.each(function(index, el) {
            var element = $(el),
                data = element.data();

            data = S.mix({
                prompt: "点击这里给我发消息",
                s: 1
            }, data);

            element.replaceWith(S.substitute(template, data));
        });
    };

    $(function() {
        light("[data-role=wangwang]");
    });

    return light;
});