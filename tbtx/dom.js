// 依赖jQuery的代码
(function(S) {
    var global = S.global,
        $ = S.$,
        noop = S.noop,
        each = S.each,
        ucfirst = S.ucfirst,
        singleton = S.singleton,
        throttle = S.throttle;

    var doc = document,
        de = doc.documentElement,
        head = doc.head || doc.getElementsByTagName("head")[0] || de;


    // jQuery singleton instances
    var $instances = [
        ["window", function() {
            return $(window);
        }],
        ["document", function() {
            return $(doc);
        }],
        ["head", function() {
            return $(head);
        }],
        ["body", function() {
            return $('body');
        }]
    ];
    each($instances, function(instance) {
        S["get" + ucfirst(instance[0])] = singleton(instance[1]);
    });

    var getDocument = S.getDocument,
        getWindow = S.getWindow,

        pageHeight = function() {
            return getDocument().height();
            // return doc.body.scrollHeight;
        },
        pageWidth = function() {
            return getDocument().width();
            // return doc.body.scrollWidth;
        },

        scrollX = function() {
            return getWindow().scrollLeft();
            // return window.pageXOffset || (de && de.scrollLeft) || doc.body.scrollLeft;
        },
        scrollY = function() {
            return getWindow().scrollTop();
            // return window.pageYOffset || (de && de.scrollTop) || doc.body.scrollTop;
        },

        viewportHeight = function() {
            return getWindow().height();
            // var de = document.documentElement;      //IE67的严格模式
            // return window.innerHeight || (de && de.clientHeight) || doc.body.clientHeight;
        },
        viewportWidth = function() {
            return getWindow().width();
            // return window.innerWidth || (de && de.clientWidth) || doc.body.clientWidth;
        },

        fullViewport = function(selector) {
            return $(selector).css({
                width: viewportWidth(),
                height: viewportHeight()
            });
        },

        fullPage = function(selector) {
            return $(selector).css({
                width: pageWidth(),
                height: pageHeight()
            });
        },

        getScroller = singleton(function() {
            var scroller = doc.body;
            if (/msie [67]/.test(navigator.userAgent.toLowerCase())) {
                scroller = doc.documentElement;
            }
            return $(scroller);
        }),
        /**
         * 停止body的滚动条
         * @return {[type]} [description]
         */
        stopBodyScroll = function() {
            getScroller().css("overflow", "hidden");
            return this;
        },
        /**
         * 恢复body的滚动条
         * @return {[type]} [description]
         */
        resetBodyScroll = function() {
            getScroller().css("overflow", "auto");
            return this;
        },

        contains = $.contains || function(a, b) {
            //noinspection JSBitwiseOperatorUsage
            return !!(a.compareDocumentPosition(b) & 16);
        },
        isInDocument = function(element) {
            return contains(de, element);
        },

        // 距离topline多少px才算inView
        // 元素是否出现在视口内
        // 超出也不在view
        isInView = function(selector, top) {
            top = top || 0;

            var element = $(selector),
                elemHeight = element.innerHeight(),
                win = getWindow(),
                winHeight = win.height();
            if (top == "center" || typeof top !== "number") {
                top = (winHeight- elemHeight)/2;
            }

            var scrollTop = win.scrollTop();
            var scrollBottom = scrollTop + winHeight;
            var elementTop = element.offset().top + top;
            var elementBottom = elementTop + elemHeight;
            // 只判断垂直位置是否在可视区域，不判断水平。只有要部分区域在可视区域，就返回 true
            return elementTop < scrollBottom && elementBottom > scrollTop;
        },

        scrollTo = function(selector) {
            var top;
            if (typeof selector == "number") {
                top = selector;
            } else {
                var $target = $(selector),
                    offsetTop = $target.offset().top;

                top = offsetTop - (viewportHeight() - $target.innerHeight())/2;
            }

            $('body,html').animate({
                scrollTop: top
            }, 800);
            return this;
        },

        limitLength = function(selector, attr, suffix) {
            var $elements = $(selector);
            suffix = suffix || '...';
            attr = attr || 'data-max';

            $elements.each(function() {
                var $element = $(this);
                var max = parseInt($element.attr(attr), 10);
                var conent = $.trim($element.text());
                if (conent.length <= max) {
                    return;
                }

                conent = conent.slice(0, max - suffix.length) + suffix;
                $element.text(conent);
            });
            return this;
        },

        flash = function(selector, flashColor, bgColor) {
            var $elements = $(selector);
            bgColor = bgColor || "#FFF";
            flashColor = flashColor || "#FF9";
            $elements.each(function(index, element) {
                var $element = $(element);
                $element.css("background-color", flashColor).fadeOut("fast", function() {
                    $element.fadeIn("fast", function() {
                        $element.css("background-color", bgColor).focus().select();
                    });
                });
            });
            return this;
        },
        // 返回顶部
        flyToTop = function(selector) {
            var $container = $(selector);

            // 大于offset消失
            var offset = $container.data("offset");
            if (offset) {
                // fade in #back-top
                S.on("window.scroll", function(top) {
                    if (top > offset) {
                        $container.fadeIn();
                    } else {
                        $container.fadeOut();
                    }
                });
            }

            // 默认监听J-fly-to-top, 没找到则监听自身
            var $flyer = $container.find(".J-fly-to-top"),
                $listener = $flyer.length ? $flyer : $container;

            $listener.on('click', function(){
                scrollTo(0);
                return false;
            });
            return this;
        },

        initWangWang = function(callback) {
            callback = callback || noop;
            var webww = "http://a.tbcdn.cn/p/header/webww-min.js";
            if (global.KISSY) {
                S.loadScript(webww, callback);
            } else {
                S.loadScript(["http://a.tbcdn.cn/s/kissy/1.2.0/kissy-min.js", webww], callback);
            }
            return this;
        };

    setTimeout(function() {
        var $window = getWindow();
        var winWidth = $window.width();
        var winHeight = $window.height();
        var scrollTop = $window.scrollTop();
        $window.on("resize", throttle(function() {
            // 干掉JSHint的检测
            var winNewWidth = $window.width();
            var winNewHeight = $window.height();
            // IE678 莫名其妙触发 resize
            // http://stackoverflow.com/questions/1852751/window-resize-event-firing-in-internet-explorer
            if (winWidth !== winNewWidth || winHeight !== winNewHeight) {
                S.trigger("window.resize", winNewWidth, winNewHeight);
            }
            winWidth = winNewWidth;
            winHeight = winNewHeight;
        }, 80)).on("scroll", throttle(function() {
            var scrollNewTop = $window.scrollTop();
            if (scrollTop !== scrollNewTop) {
                S.trigger("window.scroll", scrollNewTop, scrollTop);
                // if (scrollTop > scrollNewTop) {
                //     S.trigger("window.scroll.up", scrollNewTop, scrollTop);
                // } else {
                //     S.trigger("window.scroll.down", scrollNewTop, scrollTop);
                // }
            }

            scrollTop = scrollNewTop;
        }, 80));
    }, 0);

    S.mix({
        // page & viewport
        pageWidth: pageWidth,
        pageHeight: pageHeight,
        scrollY: scrollY,
        scrollX: scrollX,
        viewportHeight: viewportHeight,
        viewportWidth: viewportWidth,
        fullViewport: fullViewport,
        fullPage: fullPage,

        stopBodyScroll: stopBodyScroll,
        resetBodyScroll: resetBodyScroll,

        contains: contains,
        isInDocument: isInDocument,
        // support fn
        isInView: isInView,
        scrollTo: scrollTo,
        limitLength: limitLength,
        initWangWang: initWangWang,
        flash: flash,
        flyToTop: flyToTop,

        /**
         * http://www.taobao.com/go/act/video/open_dev_play.php
         * @param  {[type]} config [description]
         * @return {[type]}        [description]
         */
        embedPlayer: function(allConfig) {
            allConfig = allConfig || {};
            S.loadScript("http://api.video.taobao.com/video/getPlayerJS").done(function() {
                // 自动生成id
                $(allConfig.div).each(function(index, el) {
                    var element = $(el);
                    var config = $.extend({}, allConfig, element.data());

                    element = $("<div></div>").appendTo(element);
                    var id = "tbtx-player-" + S.uniqueCid();
                    element.attr("id", id);

                    config.div = id;

                    // vid uid div自己传
                    var must = {
                        "width": "100%",
                        "height": "100%"
                    };
                    tb_player_object.embedPlayer(S.mix(must, config), config, config);
                });

            });
        }
    });
})(tbtx);
