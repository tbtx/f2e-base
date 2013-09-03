(function(T) {
    var doc = document,
        de = document.documentElement,
        head = document.getElementsByTagName("head")[0] || de;

    function isType(type) {
        return function(obj) {
            return {}.toString.call(obj) == "[object " + type + "]";
        };
    }

    var isFunction = isType("Function");

    var baseElement = head.getElementsByTagName("base")[0];

    var IS_CSS_RE = /\.css(?:\?|$)/i;
    var READY_STATE_RE = /^(?:loaded|complete|undefined)$/;

    // 当前正在加载的script
    var currentlyAddingScript;

    // `onload` event is not supported in WebKit < 535.23 and Firefox < 9.0
    // ref:
    //  - https://bugs.webkit.org/show_activity.cgi?id=38995
    //  - https://bugzilla.mozilla.org/show_bug.cgi?id=185236
    //  - https://developer.mozilla.org/en/HTML/Element/link#Stylesheet_load_events
    var isOldWebKit = (navigator.userAgent.replace(/.*AppleWebKit\/(\d+)\..*/, "$1")) * 1 < 536;


    function request(url, callback, charset) {
        var isCSS = IS_CSS_RE.test(url);
        var node = doc.createElement(isCSS ? "link" : "script");

        if (charset) {
            var cs = isFunction(charset) ? charset(url) : charset;
            if (cs) {
                node.charset = cs;
            }
        }

        addOnload(node, callback, isCSS);

        if (isCSS) {
            node.rel = "stylesheet";
            node.href = url;
        } else {
            node.async = true;
            node.src = url;
        }

        // For some cache cases in IE 6-8, the script executes IMMEDIATELY after
        // the end of the insert execution, so use `currentlyAddingScript` to
        // hold current node, for deriving url in `define` call
        currentlyAddingScript = node;

        // ref: #185 & http://dev.jquery.com/ticket/2709
        if (baseElement) {
            head.insertBefore(node, baseElement);
        } else {
            head.appendChild(node);
        }

        currentlyAddingScript = null;
    }

    function addOnload(node, callback, isCSS) {
        // 不支持 onload事件
        var missingOnload = isCSS && (isOldWebKit || !("onload" in node));

        // for Old WebKit and Old Firefox
        if (missingOnload) {
            setTimeout(function() {
                pollCss(node, callback);
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

                callback();
            }
        };
    }

    function pollCss(node, callback) {
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
                // Place callback here to give time for style rendering
                callback();
            } else {
                pollCss(node, callback);
            }
        }, 20);
    }

    function loadCss(url, callback, charset) {
        request(url, callback, charset);
    }

    function loadScript(url, callback, charset) {
        request(url, callback, charset);
    }

        // $(document).height()
    var pageHeight = function() {
            return doc.body.scrollHeight;
        },
        pageWidth = function() {
            return doc.body.scrollWidth;
        },

        scrollX = function() {
            return window.pageXOffset || (de && de.scrollLeft) || doc.body.scrollLeft;
        },
        // $(window).scrollTop()
        scrollY = function() {
            return window.pageYOffset || (de && de.scrollTop) || doc.body.scrollTop;
        },

        // $(window).height()
        viewportHeight = function() {
            // var de = document.documentElement;      //IE67的严格模式
            return window.innerHeight || (de && de.clientHeight) || doc.body.clientHeight;
        },
        viewportWidth = function() {
            return window.innerWidth || (de && de.clientWidth) || doc.body.clientWidth;
        },

        // 距离top多少px才算inView
        isInView = function(selector, top) {
            top = top || 0;

            var $elem = $(selector);
            var offset = $elem.offset();
            // T.log(offset).log(scrollY()).log(viewportHeight()).log(top);     
            if ((viewportHeight() + scrollY()) > (offset.top + top)) {
                return true;
            } else {
                return false;
            }
        },

        // 针对absolute or fixed
        adjust = function(selector, isAbsolute, top) {
            var $elem = $(selector);

            var h = $elem.outerHeight(),
                w = $elem.outerWidth();

            top = typeof top == "number" ? top : "center";
            if (!isAbsolute) {
                isAbsolute = false; // 默认fix定位
            }

            var t;
            if (top != "center") { // @number
                t = isAbsolute ? scrollY() + top : top;
            } else {
                t = isAbsolute ? scrollY() + ((viewportHeight() - h) / 2) : (viewportHeight() - h) / 2;
            }
            if (t < 0) {
                t = 0;
            }

            var l = isAbsolute ? scrollX() + ((viewportWidth() - w) / 2) : (viewportWidth() - w) / 2;
            if (l < 0) {
                l = 0;
            }

            $elem.css({
                top: t,
                left: l
            });
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

                conent = conent.slice(0, max) + suffix;
                $element.text(conent);
            });  
        },

        initWangWang = function(callback) {
            callback = callback || function() {};
            var webww = "http://a.tbcdn.cn/p/header/webww-min.js";
            if (window.KISSY) {
                loadScript(webww, callback);
            } else {
                loadScript("http://a.tbcdn.cn/??s/kissy/1.2.0/kissy-min.js", function() {
                    loadScript(webww, callback);
                });
            }
        };

    T.mix(T, {
        loadCss: loadCss,
        loadScript: loadScript,

        pageWidth: pageWidth,
        pageHeight: pageHeight,
        scrollY: scrollY,
        scrollX: scrollX,
        viewportHeight: viewportHeight,
        viewportWidth: viewportWidth,

        isInView: isInView,
        adjust: adjust,

        limitLength: limitLength,
        initWangWang: initWangWang
    });
})(tbtx);
