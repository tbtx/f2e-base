define("dist/banner-switcher", ["jquery"], function($) {
    var S = tbtx,
        Banner = S.getQueryParam("banner");


    // 文件路径配置
    var fileConfig = {
        // "nvren_2014": "/themes/theme_banner_nvren_2014.htm"
    };
    var fileUrl = fileConfig[Banner] || S.substitute("/themes/theme_banner_{{ banner }}.htm", {
        banner: Banner
    });

    if (!Banner) {
        return;
    }

    // kissy和global的版本配置
    var versionConfig = {
        kissy: {
            // 默认版本
            def: "1.4.2"
            // 重写版本
            // "nvren_2014": "1.4.0",
        },
        global: {
            def: "3.1.1"
        }
    };

    var pattern = "http://g.tbcdn.cn/??kissy/k/{{ kissyVersion }}/seed-min.js,tb/global/{{ globalVersion }}/global-min.js",
        urlConfig = {
            global: {
                css: S.substitute("http://g.tbcdn.cn/tb/global/{{ version }}/global-min.css", {
                    version: versionConfig.global[Banner] || versionConfig.global.def
                }),
                js: S.substitute(pattern, {
                    kissyVersion: versionConfig.kissy[Banner] || versionConfig.kissy.def,
                    globalVersion: versionConfig.global[Banner] || versionConfig.global.def
                })
            }
        };

    // 要隐藏的元素
    var elementToHide = [
        // 省钱日报头
        ".wrapper-sitenav",
        ".wrapper-header",
        ".container-main-nav",
        // 蜜儿头
        "#header",
        "#header-v2"
    ].join(", ");


    /**
     * 依赖配置
     */
    var depsConfig = {
        // 默认依赖global.css, seed.js&global.js
        def: [urlConfig.global.css, urlConfig.global.js]
        // "nvren_2014": []
    };

    // 从头中提取link的css
    var css = [];
    var rlink = /<link[^>]*href=['"](.*)['"][^>]*>/img,
        match;

    $.get(fileUrl, function(response) {

        // 提取出依赖的css
        match = rlink.exec(response);
        while (match) {
            css.push(match[1]);
            match = rlink.exec(response);
        }

        S.require((depsConfig[Banner] || depsConfig.def).concat(css), function() {
            $(elementToHide).hide();
            // 删除link标签
            $("body").prepend(response.replace(/<\/?link[^>]*>/img, ""));
            S.trigger("banner.inited", Banner);
        });
    });

});