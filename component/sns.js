(function($, S) {
    var Class = S.Class,
        Widget = S.Widget,
        isArray = S.isArray;

    var SNS = new Class(Widget);

    /**
     * 支持qq空间/朋友圈,qq微博和新浪微博,人人
     * 微信请使用二维码
     * 淘江湖及来往请使用淘宝SNS
     */

    SNS.include({
        attrs: {
            caption: document.title,
            description: $('meta[name="description"]').attr("content"),
            url: location.href,
            pic: {
                value: [],
                getter: function(v) {
                    var target = this.get("target");
                    if (target == "sina") {
                        return v.join("||");
                    } else if(target == "qqweibo") {
                        return v.join("|");
                    }
                    return v[0];
                },
                setter: function(v) {
                    if (isArray(v)) {
                        return v;
                    }
                    return [v];
                }
            },
            dataAttr: "target",
            snsItem: ".tbtx-sns-item",
            shareUrl: {
                "sina": "http://service.weibo.com/share/share.php",
                "qzone": "http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey",
                "qqweibo": "http://v.t.qq.com/share/share.php",
                "douban": "http://www.douban.com/share/service",
                "renren": "http://widget.renren.com/dialog/share"
            },

            // 自定义参数
            params: {

            },

            // 额外参数
            // 比如新浪微博要appkey和@的uid
            // appkey显示微博来源
            defaultParams: {
                sina: {
                    appkey: 2328604005,
                    ralateUid: 2690564321
                },
                qqweibo: {
                    appkey: "b57f296241534213862229e7457978f7",
                }
            },

            // title url pic对应的目标网站的url参数名
            normalizeMap: {
                // pic title url
                sina: {
                    description: "title",
                },
                // url title desc pics site summary
                qzone: {
                    description: "desc",
                    pic: "pics"
                },
                qqweibo: {
                    description: "title",
                },
                renren: {
                    caption: "title",
                    url: "resourceUrl"
                },
                douban: {
                    description: "name",
                    url: "href",
                    pic: "image"
                }
            }
        },
        initProps: function() {
        },
        setup: function() {
            this.render();

            var $items = this.$(this.get("snsItem")),
                $item,
                shareUrl = this.get("shareUrl"),
                dataAttr = this.get("dataAttr"),
                self = this;

            $items.each(function(index, el) {
                $item = $(el);
                var target = $item.attr("data-" + dataAttr);

                if (target) {
                    self.set("target", target);
                    var params = self.normalize(target);

                    $item.attr({
                        href: shareUrl[target] + "?" + params,
                        target: "_blank"
                    });
                }
            });
        },

        // 将参数转为各个目标网站的参数
        normalize: function(target) {
            var ret = {},
                normalizeMap = this.get("normalizeMap"),
                defaultParams = this.get("defaultParams"),
                self = this;
            S.each(["caption", "description", "pic", "url"], function(item, index) {
                ret[normalizeMap[target][item] || item] = self.get(item);
            });

            $.extend(true, ret, defaultParams[target] || {}, this.get("params"));
            return $.param(ret);
        }
    });

    S.SNS = SNS;
})(jQuery, tbtx);