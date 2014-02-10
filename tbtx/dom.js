(function(S) {
    var global = S.global,
        $ = S.$,
        noop = S.noop,
        each = S.each,
        map = S.map,
        ucfirst = S.ucfirst,
        startsWith = S.startsWith,
        singleton = S.singleton,
        throttle = S.throttle,
        isArray = S.isArray,
        isFunction = S.isFunction;

    var doc = document,
        de = doc.documentElement,
        head = doc.head || doc.getElementsByTagName("head")[0] || de;

    var baseElement = head.getElementsByTagName("base")[0];
    var IS_CSS_RE = /\.css(?:\?|$)/i;
    var READY_STATE_RE = /^(?:loaded|complete|undefined)$/;

    // `onload` event is not supported in WebKit < 535.23 and Firefox < 9.0
    // ref:
    //  - https://bugs.webkit.org/show_activity.cgi?id=38995
    //  - https://bugzilla.mozilla.org/show_bug.cgi?id=185236
    //  - https://developer.mozilla.org/en/HTML/Element/link#Stylesheet_load_events
    var isOldWebKit = (navigator.userAgent.replace(/.*AppleWebKit\/(\d+)\..*/, "$1")) * 1 < 536;

    // 存储每个url的deferred对象
    var deferredMap = {};

    function request(url, callback, charset) {
        // 去掉script的url参数
        // if (url.indexOf("?") > -1) {
        //     url = url.split("?")[0];
        // }
        // 该url已经请求过，直接done
        var deferred = deferredMap[url];
        if (deferred) {
            deferred.done(callback);
            return deferred.promise();
        } else {    //
            deferred = deferredMap[url] = $.Deferred();
            deferred.done(callback);
        }

        var isCSS = IS_CSS_RE.test(url);
        var node = doc.createElement(isCSS ? "link" : "script");

        if (charset) {
            var cs = isFunction(charset) ? charset(url) : charset;
            if (cs) {
                node.charset = cs;
            }
        }

        addOnload(node, callback, isCSS, url);

        if (isCSS) {
            node.rel = "stylesheet";
            node.href = url;
        } else {
            node.async = true;
            node.src = url;
        }

        // ref: #185 & http://dev.jquery.com/ticket/2709
        if (baseElement) {
            head.insertBefore(node, baseElement);
        } else {
            head.appendChild(node);
        }

        return deferredMap[url].promise();
    }

    function addOnload(node, callback, isCSS, url) {
        // 不支持 onload事件
        var missingOnload = isCSS && (isOldWebKit || !("onload" in node));

        // for Old WebKit and Old Firefox
        if (missingOnload) {
            setTimeout(function() {
                pollCss(node, callback, url);
            }, 1); // Begin after node insertion
            return;
        }

        // 支持onload事件
        node.onload = node.onerror = node.onreadystatechange = function() {
            if (READY_STATE_RE.test(node.readyState)) {

                // Ensure only run once and handle memory leak in IE
                node.onload = node.onerror = node.onreadystatechange = null;

                // Remove the script to reduce memory leak
                if (!isCSS) {
                    head.removeChild(node);
                }

                // Dereference the node
                node = null;


                deferredMap[url].resolve();
                // alert("resolve");
                // callback();
            }
        };
    }

    function pollCss(node, callback, url) {
        var sheet = node.sheet;
        var isLoaded;

        // for WebKit < 536
        if (isOldWebKit) {
            if (sheet) {
                isLoaded = true;
            }
        }
        // for Firefox < 9.0
        else if (sheet) {
            try {
                if (sheet.cssRules) {
                    isLoaded = true;
                }
            } catch (ex) {
                // The value of `ex.name` is changed from "NS_ERROR_DOM_SECURITY_ERR"
                // to "SecurityError" since Firefox 13.0. But Firefox is less than 9.0
                // in here, So it is ok to just rely on "NS_ERROR_DOM_SECURITY_ERR"
                if (ex.name === "NS_ERROR_DOM_SECURITY_ERR") {
                    isLoaded = true;
                }
            }
        }

        setTimeout(function() {
            if (isLoaded) {
                deferredMap[url].resolve();
                // Place callback here to give time for style rendering
                // callback();
            } else {
                pollCss(node, callback);
            }
        }, 20);
    }

    // 获取脚本的绝对url
    function getScriptAbsoluteSrc(node) {
        return node.hasAttribute ? // non-IE6/7
            node.src :
            // see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
            node.getAttribute("src", 4);
    }

    var SCHEME_RE = /^(http|file)/i;
    /**
     * 请求的相对url转为绝对
     * @param  {string} url
     * @return {string} normalizedUrl
     */
    function normalizeUrl(url) {
        if (!SCHEME_RE.test(url)) {
            url = S.staticUrl + url;
        }
        return url;
    }

    function loadCss(url, callback, charset) {
        url = normalizeUrl(url);
        return request(url, callback, charset);
    }

    function loadScript(url, callback, charset) {
        // url传入数组，按照数组中脚本的顺序进行加载
        if (isArray(url)) {
            var chain,
                length = url.length;

            url = map(url, function(item) {
                return normalizeUrl(item);
            });

            // 如果使用deferred的resolve date来解决时，不能同时请求
            chain = request(url[0], noop, charset);
            S.reduce(url, function(prev, now, index, array) {
                chain = chain.then(function() {
                    return request(now, noop, charset);
                });

                // reduce的返回
                return now;
            });
            return chain.then(callback);
        }
        return request(normalizeUrl(url), callback, charset);
    }

    // 获取tbtx所在script的的src
    function getLoaderSrc() {
        var scripts = doc.scripts;
        var node,
            src;

        for (var i = scripts.length - 1; i >= 0; i--) {
            node = scripts[i];
            src = getScriptAbsoluteSrc(node);
            if (src && /tbtx\.(min\.)?js/.test(src)) {
                return src;
            }
        }
        return null;
    }

    var DOT_RE = /\/\.\//g;
    var DOUBLE_DOT_RE = /\/[^/]+\/\.\.\//;

    // Canonicalize a path
    // realpath("http://test.com/a//./b/../c") ==> "http://test.com/a/c"
    function realpath(path) {
        // /a/b/./c/./d ==> /a/b/c/d
        path = path.replace(DOT_RE, "/");

        // a/b/c/../../d  ==>  a/b/../d  ==>  a/d
        while (path.match(DOUBLE_DOT_RE)) {
            path = path.replace(DOUBLE_DOT_RE, "/");
        }

        return path;
    }
    // file:///E:/tbcdn or cdn(如a.tbcdn.cn/apps/tbtx)
    // 使用tbtx所在script获取到staticUrl
    // 除非脚本名不是tbtx.js or tbtx.min.js，使用默认的staticUrl
    var loaderSrc = getLoaderSrc();
    if (loaderSrc) {
        // delete base js tbtx.js
        S.staticUrl = realpath(loaderSrc + "/../../../");
    }
    // end request

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
            var scroller = document.body;
            if (/msie [67]/.test(navigator.userAgent.toLowerCase())) {
                scroller = document.documentElement;
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
                loadScript(webww, callback);
            } else {
                loadScript(["http://a.tbcdn.cn/s/kissy/1.2.0/kissy-min.js", webww], callback);
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
        // load
        realpath: realpath,
        loadCss: loadCss,
        loadScript: loadScript,
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
        flyToTop: flyToTop
    });
})(tbtx);
