/* tbtx-base-js -- 2013-10-09 */
(function(global, tbtx) {

    global[tbtx] = {

        /**
         * 在log环境下输出log信息，避免因为忘记删除log语句而引发错误
         * @param  {string} msg 消息
         * @param  {string} cat 类型，如error/info等，可选
         * @param  {string} src 消息来源，可选
         * @return {object}     返回tbtx以链式调用，如tbtx.log().log()
         */
        log: function(msg, cat, src) {
            if (src) {
                msg = src + ': ' + msg;
            }
            if (global['console'] !== undefined && console.log) {
                console[cat && console[cat] ? cat : 'log'](msg);
            }

            return this;
        },

        /*
         * debug mod off
         */
        debug: false,

        /**
         * global对象，在浏览器环境中为window
         * @type {object}
         */
        global: global,

        /**
         * 存放数据
         * @type {jQuery Object}
         */
        _data: jQuery({}),

        /**
         * 存取数据
         * @param  {string} key   键值
         * @param  {any} value 存放值
         */
        data: function() {
            var self = this;
            return self._data.data.apply(self._data, arguments);
        },

        removeData: function() {
            var self = this;
            return self._data.removeData.apply(self._data, arguments);
        },

        /**
         * 空函数，在需要使用空函数作为参数时使用
         */
        noop: function() {}
    };

})(this, 'tbtx');


;(function(global) {
    // 语言扩展
    var toString = Object.prototype.toString,

        AP = Array.prototype,

        isString = function(val) {
            return toString.call(val) === '[object String]';
        },

        isNotEmptyString = function(val) {
            return isString(val) && val !== '';
        },

        isArray = Array.isArray || function(val) {
            return toString.call(val) === '[object Array]';
        },

        inArray = function(arr, item) {
            return indexOf(arr, item) > -1;
        },

        indexOf = AP.indexOf ?
            function(arr, item) {
                return arr.indexOf(item);
        } :
            function(arr, item) {
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i] === item) {
                        return i;
                    }
                }
                return -1;
        },

        hasEnumBug = !({
            toString: 1
        }['propertyIsEnumerable']('toString')),
        enumProperties = [
            'constructor',
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'toString',
            'toLocaleString',
            'valueOf'
        ],
        keys = function(o) {
            var ret = [],
                p,
                i;
            for (p in o) {
                ret.push(p);
            }
            if (hasEnumBug) {
                for (i = enumProperties.length - 1; i >= 0; i--) {
                    p = enumProperties[i];
                    if (o.hasOwnProperty(p)) {
                        result.push(p);
                    }
                }
            }

            return ret;
        },

        startsWith = function(str, prefix) {
            return str.lastIndexOf(prefix, 0) === 0;
        },

        endsWith = function(str, suffix) {
            var index = str.length - suffix.length;
            return index >= 0 && str.indexOf(suffix, index) == index;
        },

        // oo实现
        Class = function(parent) {
            var klass = function() {
                this.init.apply(this, arguments);
            };

            if (parent) {
                var subclass = function() {};
                subclass.prototype = parent.prototype;
                klass.prototype = new subclass();
            }

            klass.prototype.init = function() {}; // need to be overwrite
            klass.fn = klass.prototype;

            klass.fn.constructor = klass;
            klass.fn.parent = klass;

            // 在事件处理程序中保证this指向klass, not 事件发生元素
            klass.proxy = function(func) {
                var self = this;
                return (function() {
                    return func.apply(self, arguments);
                });
            };
            klass.fn.proxy = klass.proxy;

            // 添加类属性
            klass.extend = function(object) {
                var extended = object.extended;

                mix(klass, object, ['extended']);

                if (extended) {
                    extended(klass);
                }
            };

            // 向原型上添加实例属性
            klass.include = function(object) {
                var included = object.included;

                mix(klass.fn, object, ['included']);

                if (included) {
                    included(klass);
                }
            };

            return klass;

        },

        Now = Date.now || function() {
            return +new Date();
        },

        // 在underscore里面有实现，这个版本借鉴的是kissy
        throttle = function(fn, ms, context) {
            ms = ms || 100; // 150 -> 100

            if (ms === -1) {
                return (function() {
                    fn.apply(context || this, arguments);
                });
            }

            var last = Now();

            return (function() {
                var now = Now();
                if (now - last > ms) {
                    last = now;
                    fn.apply(context || this, arguments);
                }
            });
        },

        // 函数柯里化
        // 调用同样的函数并且传入的参数大部分都相同的时候，就是考虑柯里化的理想场景
        curry = function(fn) {
            var slice = [].slice,
                args = slice.call(arguments, 1);

            return function() {
                var innerArgs = slice.call(arguments),
                    retArgs = args.concat(innerArgs);

                return fn.apply(null, retArgs);
            };
        },

        // {{ name }} -> {{ o[name] }}
        // \{{}} -> \{{}}
        // based on Django, fix kissy, support blank -> {{ name }}, not only {{name}}
        substitute = function(str, o, regexp) {
            if (!isString(str)) {
                return str;
            }
            return str.replace(regexp || /\\?\{\{\s*([^{}\s]+)\s*\}\}/g, function(match, name) {
                if (match.charAt(0) === '\\') {
                    return match.slice(1);
                }
                return (o[name] === undefined) ? '' : o[name];
            });
        },

        // query字符串转为对象
        unparam = function(str, sep, eq) {
            if (!isString(str)) {
                return {};
            }
            sep = sep || '&';
            eq = eq || '=';

            var ret = {},
                eqIndex,
                decode = decodeURIComponent,
                pairs = str.split(sep),
                key, val,
                i = 0,
                len = pairs.length;

            for (; i < len; ++i) {
                eqIndex = indexOf(pairs[i], eq);
                if (eqIndex == -1) { // 没有=
                    key = decode(pairs[i]);
                    val = undefined;
                } else {
                    // remember to decode key!
                    key = decode(pairs[i].substring(0, eqIndex));
                    val = pairs[i].substring(eqIndex + 1);
                    try {
                        val = decode(val);
                    } catch (e) {
                        tbtx.log(e + 'decodeURIComponent error : ' + val, 'error');
                    }
                }
                ret[key] = val;
            }
            return ret;
        },

        getQueryParam = function(name, url) {
            if (!url) {
                url = location.href;
            }
            var ret;

            var search;
            if (url.indexOf('?') > -1) {
                search = url.split('?')[1];
            } else {
                ret = name ? '': {};
                return ret;
            }

            ret = unparam(search);
            if (name) {
                return ret[name] || '';
            }
            return ret;
        },


        htmlEntities = {
            '&amp;': '&',
            '&gt;': '>',
            '&lt;': '<',
            '&#x60;': '`',
            '&#x2F;': '/',
            '&quot;': '"',
            '&#x27;': "'"
        },
        reverseEntities = {},
        escapeReg,
        unEscapeReg,
        EMPTY = '',
        getEscapeReg = function() {
            if (escapeReg) {
                return escapeReg;
            }
            var str = EMPTY;
            $.each(htmlEntities, function(index, entity) {
                str += entity + '|';
            });
            str = str.slice(0, -1);
            escapeReg = new RegExp(str, 'g');
            return escapeReg;
        },

        getUnEscapeReg = function() {
            if (unEscapeReg) {
                return unEscapeReg;
            }
            var str = EMPTY;
            $.each(reverseEntities, function(index, entity) {
                str += entity + '|';
            });
            str += '&#(\\d{1,5});';
            unEscapeReg = new RegExp(str, 'g');
            return unEscapeReg;
        },

        escapeHtml = function(text) {
            return String(text).replace(getEscapeReg(), function(all) {
                return reverseEntities[all];
            });
        },
        unEscapeHtml = function(text) {
            return String(text).replace(getUnEscapeReg(), function(all) {
                return htmlEntities[all];
            });
        };

    (function() {
        for (var k in htmlEntities) {
            reverseEntities[htmlEntities[k]] = k;
        }
    })();

    var mix = tbtx.mix = function(des, source, blacklist, over) {
        var i;
        if (!des || des === source) {
            return des;
        }
        // 扩展自身
        if (!source) {
            source = des;
            des = tbtx;
        }
        if (!blacklist) {
            blacklist = [];
        }
        if (!over) {
            over = true; // 默认重写
        }
        for (i in source) {
            if (inArray(blacklist, i)) {
                continue;
            }
            if (over || !(i in des)) {
                des[i] = source[i];
            }
        }
        return des;
    };

    // exports
    mix({
        mix: mix,
        isNotEmptyString: isNotEmptyString,
        isArray: isArray,
        inArray: inArray,
        indexOf: indexOf,
        keys: keys,
        startsWith: startsWith,
        endsWith: endsWith,
        Class: Class,
        Now: Now,
        throttle: throttle,
        curry: curry,
        substitute: substitute,
        unparam: unparam,
        getQueryParam: getQueryParam,
        escapeHtml: escapeHtml,
        unEscapeHtml: unEscapeHtml
    });
})(this);


;(function(global) {
    var toString = Object.prototype.toString,

        isString = function(val) {
            return toString.call(val) === '[object String]';
        },

        isNotEmptyString = function(val) {
            return isString(val) && val !== '';
        };

    // kissy start
    var doc = document,
        MILLISECONDS_OF_DAY = 24 * 60 * 60 * 1000,
        encode = encodeURIComponent,
        decode = decodeURIComponent;

    var cookie = {
        /**
         * 获取 cookie 值
         * @return {string} 如果 name 不存在，返回 undefined
         */
        get: function(name) {
            var ret, m;

            if (isNotEmptyString(name)) {
                if ((m = String(doc.cookie).match(
                    new RegExp('(?:^| )' + name + '(?:(?:=([^;]*))|;|$)')))) {
                    ret = m[1] ? decode(m[1]) : '';
                }
            }
            return ret;
        },

        set: function(name, val, domain, expires, path, secure) {
            var text = String(encode(val)),
                date = expires;

            // 从当前时间开始，多少天后过期
            if (typeof date === 'number') {
                date = new Date();
                date.setTime(date.getTime() + expires * MILLISECONDS_OF_DAY);
            }

            // expiration date
            if (date instanceof Date) {
                text += '; expires=' + date.toUTCString();
            }

            // domain
            if (isNotEmptyString(domain)) {
                text += '; domain=' + domain;
            }

            // path
            if (isNotEmptyString(path)) {
                text += '; path=' + path;
            }

            // secure
            if (secure) {
                text += '; secure';
            }

            doc.cookie = name + '=' + text;
        },

        remove: function(name, domain, path, secure) {
            // 置空，并立刻过期
            this.set(name, '', domain, -1, path, secure);
        }
    };

    if (global.tbtx) {
        tbtx.cookie = cookie;
    } else {
        jQuery.cookie = cookie;
    }
})(this);


;(function(global) {
    /*
     * aralejs detector
     * detector.browser.name
     * !!detector.browser.ie
     * detector.browser.ie && detector.browser.version < 8
     */

    var detector = {};
    var NA_VERSION = "-1";
    var userAgent = navigator.userAgent || "";
    //var platform = navigator.platform || "";
    var appVersion = navigator.appVersion || "";
    var vendor = navigator.vendor || "";
    var external = window.external;
    var re_msie = /\b(?:msie |ie |trident\/[0-9].*rv[ :])([0-9.]+)/;

    function toString(object) {
        return Object.prototype.toString.call(object);
    }

    function isObject(object) {
        return toString(object) === "[object Object]";
    }

    function isFunction(object) {
        return toString(object) === "[object Function]";
    }

    function each(object, factory, argument) {
        for (var i = 0, b, l = object.length; i < l; i++) {
            if (factory.call(object, object[i], i) === false) {
                break;
            }
        }
    }
    // 硬件设备信息识别表达式。
    // 使用数组可以按优先级排序。
    var DEVICES = [
        ["nokia",
            function(ua) {
                // 不能将两个表达式合并，因为可能出现 "nokia; nokia 960"
                // 这种情况下会优先识别出 nokia/-1
                if (ua.indexOf("nokia ") !== -1) {
                    return /\bnokia ([0-9]+)?/;
                } else if (ua.indexOf("noain") !== -1) {
                    return /\bnoain ([a-z0-9]+)/;
                } else {
                    return /\bnokia([a-z0-9]+)?/;
                }
            }
        ], // 三星有 Android 和 WP 设备。
        ["samsung",
            function(ua) {
                if (ua.indexOf("samsung") !== -1) {
                    return /\bsamsung(?:\-gt)?[ \-]([a-z0-9\-]+)/;
                } else {
                    return /\b(?:gt|sch)[ \-]([a-z0-9\-]+)/;
                }
            }
        ],
        ["wp",
            function(ua) {
                return ua.indexOf("windows phone ") !== -1 || ua.indexOf("xblwp") !== -1 || ua.indexOf("zunewp") !== -1 || ua.indexOf("windows ce") !== -1;
            }
        ],
        ["pc", "windows"],
        ["ipad", "ipad"], // ipod 规则应置于 iphone 之前。
        ["ipod", "ipod"],
        ["iphone", /\biphone\b|\biph(\d)/],
        ["mac", "macintosh"],
        ["mi", /\bmi[ \-]?([a-z0-9 ]+(?= build))/],
        ["aliyun", /\baliyunos\b(?:[\-](\d+))?/],
        ["meizu", /\b(?:meizu\/|m)([0-9]+)\b/],
        ["nexus", /\bnexus ([0-9s.]+)/],
        ["huawei",
            function(ua) {
                if (ua.indexOf("huawei-huawei") !== -1) {
                    return /\bhuawei\-huawei\-([a-z0-9\-]+)/;
                } else {
                    return /\bhuawei[ _\-]?([a-z0-9]+)/;
                }
            }
        ],
        ["lenovo",
            function(ua) {
                if (ua.indexOf("lenovo-lenovo") !== -1) {
                    return /\blenovo\-lenovo[ \-]([a-z0-9]+)/;
                } else {
                    return /\blenovo[ \-]?([a-z0-9]+)/;
                }
            }
        ], // 中兴
        ["zte",
            function(ua) {
                if (/\bzte\-[tu]/.test(ua)) {
                    return /\bzte-[tu][ _\-]?([a-su-z0-9\+]+)/;
                } else {
                    return /\bzte[ _\-]?([a-su-z0-9\+]+)/;
                }
            }
        ], // 步步高
        ["vivo", /\bvivo ([a-z0-9]+)/],
        ["htc",
            function(ua) {
                if (/\bhtc[a-z0-9 _\-]+(?= build\b)/.test(ua)) {
                    return /\bhtc[ _\-]?([a-z0-9 ]+(?= build))/;
                } else {
                    return /\bhtc[ _\-]?([a-z0-9 ]+)/;
                }
            }
        ],
        ["oppo", /\boppo[_]([a-z0-9]+)/],
        ["konka", /\bkonka[_\-]([a-z0-9]+)/],
        ["sonyericsson", /\bmt([a-z0-9]+)/],
        ["coolpad", /\bcoolpad[_ ]?([a-z0-9]+)/],
        ["lg", /\blg[\-]([a-z0-9]+)/],
        ["android", "android"],
        ["blackberry", "blackberry"]
    ];
    // 操作系统信息识别表达式
    var OS = [
        ["wp",
            function(ua) {
                if (ua.indexOf("windows phone ") !== -1) {
                    return /\bwindows phone (?:os )?([0-9.]+)/;
                } else if (ua.indexOf("xblwp") !== -1) {
                    return /\bxblwp([0-9.]+)/;
                } else if (ua.indexOf("zunewp") !== -1) {
                    return /\bzunewp([0-9.]+)/;
                }
                return "windows phone";
            }
        ],
        ["windows", /\bwindows nt ([0-9.]+)/],
        ["macosx", /\bmac os x ([0-9._]+)/],
        ["ios",
            function(ua) {
                if (/\bcpu(?: iphone)? os /.test(ua)) {
                    return /\bcpu(?: iphone)? os ([0-9._]+)/;
                } else if (ua.indexOf("iph os ") !== -1) {
                    return /\biph os ([0-9_]+)/;
                } else {
                    return /\bios\b/;
                }
            }
        ],
        ["yunos", /\baliyunos ([0-9.]+)/],
        ["android", /\bandroid[\/\- ]?([0-9.x]+)?/],
        ["chromeos", /\bcros i686 ([0-9.]+)/],
        ["linux", "linux"],
        ["windowsce", /\bwindows ce(?: ([0-9.]+))?/],
        ["symbian", /\bsymbian(?:os)?\/([0-9.]+)/],
        ["meego", /\bmeego\b/],
        ["blackberry", "blackberry"]
    ];
    /*
     * 解析使用 Trident 内核的浏览器的 `浏览器模式` 和 `文档模式` 信息。
     * @param {String} ua, userAgent string.
     * @return {Object}
     */

    function IEMode(ua) {
        if (!re_msie.test(ua)) {
            return null;
        }
        var m, engineMode, engineVersion, browserMode, browserVersion, compatible = false;
        // IE8 及其以上提供有 Trident 信息，
        // 默认的兼容模式，UA 中 Trident 版本不发生变化。
        if (ua.indexOf("trident/") !== -1) {
            m = /\btrident\/([0-9.]+)/.exec(ua);
            if (m && m.length >= 2) {
                // 真实引擎版本。
                engineVersion = m[1];
                var v_version = m[1].split(".");
                v_version[0] = parseInt(v_version[0], 10) + 4;
                browserVersion = v_version.join(".");
            }
        }
        m = re_msie.exec(ua);
        browserMode = m[1];
        var v_mode = m[1].split(".");
        if ("undefined" === typeof browserVersion) {
            browserVersion = browserMode;
        }
        v_mode[0] = parseInt(v_mode[0], 10) - 4;
        engineMode = v_mode.join(".");
        if ("undefined" === typeof engineVersion) {
            engineVersion = engineMode;
        }
        return {
            browserVersion: browserVersion,
            browserMode: browserMode,
            engineVersion: engineVersion,
            engineMode: engineMode,
            compatible: engineVersion !== engineMode
        };
    }
    /**
     * 针对同源的 TheWorld 和 360 的 external 对象进行检测。
     * @param {String} key, 关键字，用于检测浏览器的安装路径中出现的关键字。
     * @return {Undefined,Boolean,Object} 返回 undefined 或 false 表示检测未命中。
     */

    function checkTW360External(key) {
        if (!external) {
            return;
        }
        // return undefined.
        try {
            //        360安装路径：
            //        C:%5CPROGRA~1%5C360%5C360se3%5C360SE.exe
            var runpath = external.twGetRunPath.toLowerCase();
            // 360SE 3.x ~ 5.x support.
            // 暴露的 external.twGetVersion 和 external.twGetSecurityID 均为 undefined。
            // 因此只能用 try/catch 而无法使用特性判断。
            var security = external.twGetSecurityID(window);
            var version = external.twGetVersion(security);
            if (runpath && runpath.indexOf(key) === -1) {
                return false;
            }
            if (version) {
                return {
                    version: version
                };
            }
        } catch (ex) {}
    }
    var ENGINE = [
        ["trident", re_msie], //["blink", /blink\/([0-9.+]+)/],
        ["webkit", /\bapplewebkit[\/]?([0-9.+]+)/],
        ["gecko", /\bgecko\/(\d+)/],
        ["presto", /\bpresto\/([0-9.]+)/],
        ["androidwebkit", /\bandroidwebkit\/([0-9.]+)/],
        ["coolpadwebkit", /\bcoolpadwebkit\/([0-9.]+)/]
    ];
    var BROWSER = [ // Sogou.
        ["sg", / se ([0-9.x]+)/], // TheWorld (世界之窗)
        // 由于裙带关系，TW API 与 360 高度重合。
        // 只能通过 UA 和程序安装路径中的应用程序名来区分。
        // TheWorld 的 UA 比 360 更靠谱，所有将 TheWorld 的规则放置到 360 之前。
        ["tw",
            function(ua) {
                var x = checkTW360External("theworld");
                if (typeof x !== "undefined") {
                    return x;
                }
                return "theworld";
            }
        ], // 360SE, 360EE.
        ["360",
            function(ua) {
                var x = checkTW360External("360se");
                if (typeof x !== "undefined") {
                    return x;
                }
                if (ua.indexOf("360 aphone browser") !== -1) {
                    return /\b360 aphone browser \(([^\)]+)\)/;
                }
                return /\b360(?:se|ee|chrome|browser)\b/;
            }
        ], // Maxthon
        ["mx",
            function(ua) {
                try {
                    if (external && (external.mxVersion || external.max_version)) {
                        return {
                            version: external.mxVersion || external.max_version
                        };
                    }
                } catch (ex) {}
                return /\bmaxthon(?:[ \/]([0-9.]+))?/;
            }
        ],
        ["qq", /\bm?qqbrowser\/([0-9.]+)/],
        ["green", "greenbrowser"],
        ["tt", /\btencenttraveler ([0-9.]+)/],
        ["lb",
            function(ua) {
                if (ua.indexOf("lbbrowser") === -1) {
                    return false;
                }
                var version;
                try {
                    if (external && external.LiebaoGetVersion) {
                        version = external.LiebaoGetVersion();
                    }
                } catch (ex) {}
                return {
                    version: version || NA_VERSION
                };
            }
        ],
        ["tao", /\btaobrowser\/([0-9.]+)/],
        ["fs", /\bcoolnovo\/([0-9.]+)/],
        ["sy", "saayaa"], // 有基于 Chromniun 的急速模式和基于 IE 的兼容模式。必须在 IE 的规则之前。
        ["baidu", /\bbidubrowser[ \/]([0-9.x]+)/], // 后面会做修复版本号，这里只要能识别是 IE 即可。
        ["ie", re_msie],
        ["mi", /\bmiuibrowser\/([0-9.]+)/], // Opera 15 之后开始使用 Chromniun 内核，需要放在 Chrome 的规则之前。
        ["opera",
            function(ua) {
                var re_opera_old = /\bopera.+version\/([0-9.ab]+)/;
                var re_opera_new = /\bopr\/([0-9.]+)/;
                return re_opera_old.test(ua) ? re_opera_old : re_opera_new;
            }
        ],
        ["chrome", / (?:chrome|crios|crmo)\/([0-9.]+)/], // UC 浏览器，可能会被识别为 Android 浏览器，规则需要前置。
        ["uc",
            function(ua) {
                if (ua.indexOf("ucbrowser/") >= 0) {
                    return /\bucbrowser\/([0-9.]+)/;
                } else if (/\buc\/[0-9]/.test(ua)) {
                    return /\buc\/([0-9.]+)/;
                } else if (ua.indexOf("ucweb") >= 0) {
                    return /\bucweb[\/]?([0-9.]+)?/;
                } else {
                    return /\b(?:ucbrowser|uc)\b/;
                }
            }
        ], // Android 默认浏览器。该规则需要在 safari 之前。
        ["android",
            function(ua) {
                if (ua.indexOf("android") === -1) {
                    return;
                }
                return /\bversion\/([0-9.]+(?: beta)?)/;
            }
        ],
        ["safari", /\bversion\/([0-9.]+(?: beta)?)(?: mobile(?:\/[a-z0-9]+)?)? safari\//], // 如果不能被识别为 Safari，则猜测是 WebView。
        ["webview", /\bcpu(?: iphone)? os (?:[0-9._]+).+\bapplewebkit\b/],
        ["firefox", /\bfirefox\/([0-9.ab]+)/],
        ["nokia", /\bnokiabrowser\/([0-9.]+)/]
    ];
    /**
     * UserAgent Detector.
     * @param {String} ua, userAgent.
     * @param {Object} expression
     * @return {Object}
     *    返回 null 表示当前表达式未匹配成功。
     */

    function detect(name, expression, ua) {
        var expr = isFunction(expression) ? expression.call(null, ua) : expression;
        if (!expr) {
            return null;
        }
        var info = {
            name: name,
            version: NA_VERSION,
            codename: ""
        };
        var t = toString(expr);
        if (expr === true) {
            return info;
        } else if (t === "[object String]") {
            if (ua.indexOf(expr) !== -1) {
                return info;
            }
        } else if (isObject(expr)) {
            // Object
            if (expr.hasOwnProperty("version")) {
                info.version = expr.version;
            }
            return info;
        } else if (expr.exec) {
            // RegExp
            var m = expr.exec(ua);
            if (m) {
                if (m.length >= 2 && m[1]) {
                    info.version = m[1].replace(/_/g, ".");
                } else {
                    info.version = NA_VERSION;
                }
                return info;
            }
        }
    }
    var na = {
        name: "na",
        version: NA_VERSION
    };
    // 初始化识别。

    function init(ua, patterns, factory, detector) {
        var detected = na;
        each(patterns, function(pattern) {
            var d = detect(pattern[0], pattern[1], ua);
            if (d) {
                detected = d;
                return false;
            }
        });
        factory.call(detector, detected.name, detected.version);
    }
    /**
     * 解析 UserAgent 字符串
     * @param {String} ua, userAgent string.
     * @return {Object}
     */
    var parse = function(ua) {
        ua = (ua || "").toLowerCase();
        var d = {};
        init(ua, DEVICES, function(name, version) {
            var v = parseFloat(version);
            d.device = {
                name: name,
                version: v,
                fullVersion: version
            };
            d.device[name] = v;
        }, d);
        init(ua, OS, function(name, version) {
            var v = parseFloat(version);
            d.os = {
                name: name,
                version: v,
                fullVersion: version
            };
            d.os[name] = v;
        }, d);
        var ieCore = IEMode(ua);
        init(ua, ENGINE, function(name, version) {
            var mode = version;
            // IE 内核的浏览器，修复版本号及兼容模式。
            if (ieCore) {
                version = ieCore.engineVersion || ieCore.engineMode;
                mode = ieCore.engineMode;
            }
            var v = parseFloat(version);
            d.engine = {
                name: name,
                version: v,
                fullVersion: version,
                mode: parseFloat(mode),
                fullMode: mode,
                compatible: ieCore ? ieCore.compatible : false
            };
            d.engine[name] = v;
        }, d);
        init(ua, BROWSER, function(name, version) {
            var mode = version;
            // IE 内核的浏览器，修复浏览器版本及兼容模式。
            if (ieCore) {
                // 仅修改 IE 浏览器的版本，其他 IE 内核的版本不修改。
                if (name === "ie") {
                    version = ieCore.browserVersion;
                }
                mode = ieCore.browserMode;
            }
            var v = parseFloat(version);
            d.browser = {
                name: name,
                version: v,
                fullVersion: version,
                mode: parseFloat(mode),
                fullMode: mode,
                compatible: ieCore ? ieCore.compatible : false
            };
            d.browser[name] = v;
        }, d);
        return d;
    };
    detector = parse(userAgent + " " + appVersion + " " + vendor);
    detector.parse = parse;


    var mobilePattern = /(iPod|iPhone|Android|Opera Mini|BlackBerry|webOS|UCWEB|Blazer|PSP|IEMobile|Symbian)/g;
    var decideMobile = function(ua) {
        var match = mobilePattern.exec(ua);
        return match ? match[1]: '';
    };

    detector.mobile = decideMobile(userAgent);
    
    tbtx.mix({
        detector: detector,
        decideMobile: decideMobile,
        isIE6: detector.browser.ie && detector.browser.version == 6,
        isMobile: !! detector.mobile
    });
})(this);


;(function(global, $) {
    var doc = document,
        de = document.documentElement,
        head = document.getElementsByTagName("head")[0] || de;

    function isType(type) {
        return function(obj) {
            return {}.toString.call(obj) == "[object " + type + "]";
        };
    }
    var isArray = Array.isArray || isType("Array");
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

    // 存储每个url的deferred对象
    var deferredMap = {};
    // 存储每个script的下一个脚本信息，也就是链式调用时resolve的data
    var resolveDate = {};

    function request(url, callback, charset) {
        // 该url已经请求过，直接done
        if (deferredMap[url]) {
            deferredMap[url].done(callback);
            return deferredMap[url].promise();
        } else {    //
            deferredMap[url] = jQuery.Deferred();
            deferredMap[url].done(callback);
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

                if (resolveDate[url]) {
                    deferredMap[url].resolve(resolveDate[url], tbtx.noop);
                } else {
                    deferredMap[url].resolve();
                }
                // callback();
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
                deferredMap[url].resolve();
                // Place callback here to give time for style rendering
                // callback();
            } else {
                pollCss(node, callback);
            }
        }, 20);
    }

    // 给传入的相对url加上前缀
    function normalizeUrl(url) {
        if (/^https?/.test(url)) {
            // do nothing
        } else {        // 相对地址转为绝对地址
            var prefix = "http://a.tbcdn.cn/apps/tbtx";
            if (tbtx.startsWith(url, '/')) {
                url = prefix + url;
            } else {
                url = prefix + '/' + url;
            }
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

            $.each(url, function(index, u) {

                u = normalizeUrl(u);
                if (index < length - 1 ) {
                    resolveDate[u] = url[index + 1];
                }
                if (chain) {
                    chain = chain.then(request);
                } else {
                    chain = request(u, tbtx.noop, charset);
                }
            });

            return chain.then(callback);
        }
        return request(url, callback, charset);
    }

    var pageHeight = function() {
            return $(document).height();
            // return doc.body.scrollHeight;
        },
        pageWidth = function() {
            return $(document).width();
            // return doc.body.scrollWidth;
        },

        scrollX = function() {
            return $(window).scrollLeft();
            // return window.pageXOffset || (de && de.scrollLeft) || doc.body.scrollLeft;
        },
        // $(window).scrollTop()
        scrollY = function() {
            return $(window).scrollTop();
            // return window.pageYOffset || (de && de.scrollTop) || doc.body.scrollTop;
        },

        // $(window).height()
        viewportHeight = function() {
            return $(window).height();
            // var de = document.documentElement;      //IE67的严格模式
            // return window.innerHeight || (de && de.clientHeight) || doc.body.clientHeight;
        },
        viewportWidth = function() {
            return $(window).width();
            // return window.innerWidth || (de && de.clientWidth) || doc.body.clientWidth;
        },

        // 距离top多少px才算inView
        isInView = function(selector, top) {
            top = top || 0;

            var $element = $(selector);
            var offset = $element.offset();
            if ((viewportHeight() + scrollY()) > (offset.top + top)) {
                return true;
            } else {
                return false;
            }
        },

        // 针对absolute or fixed
        adjust = function(selector, isAbsolute, top) {
            var $element = $(selector);

            var h = $element.outerHeight(),
                w = $element.outerWidth();

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

            $element.css({
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

        flash = function(selector, flashColor, bgColor) {
            var $elements = $(selector);
            bgColor = bgColor || "#FFF";
            flashColor = flashColor || "#FF9";

            $.each($elements, function(index, element) {
                var $element = $(element);
                var backgroundColor = $element.css("background-color");
                $element.css("background-color", flashColor).fadeOut("fast", function() {
                    $element.fadeIn("fast", function() {
                        $element.css("background-color", backgroundColor || bgColor);
                    });
                });
            });
        },

        initWangWang = function(callback) {
            callback = callback || function() {};
            var webww = "http://a.tbcdn.cn/p/header/webww-min.js";
            if (window.KISSY) {
                loadScript(webww, callback);
            } else {
                loadScript(["http://a.tbcdn.cn/??s/kissy/1.2.0/kissy-min.js", webww], callback);
            }
        };

    tbtx.mix({
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
        initWangWang: initWangWang,
        flash: flash
    });
})(this, jQuery);


;(function(global) {
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


    tbtx.mix({
        ROOT: ROOT,
        path: path
    });
})(this);


;(function(global, $) {

    var miieeJSToken = function() {
        var token = Math.random().toString().substr(2) + (new Date()).getTime().toString().substr(1) + Math.random().toString().substr(2);
        tbtx.cookie.set('MIIEE_JTOKEN', token, '', '', '/');
        return token;
    };

    var userCheckAjax;
    var userCheck = function(callSuccess, callFailed) {
        userCheckAjax = userCheckAjax || $.ajax({
            type: "POST",
            url: tbtx.path.getuserinfo,
            dataType: 'json',
            data: {},
            timeout: 5000
        }).done(function(json) {
            if (json.result && json.result.data) {
                tbtx.data('user', json.result.data);
            }
        });

        userCheckAjax.done(function(json) {
            var code = json.code;
            if (code == 601) {
                callFailed();
            } else if (code == 100 || code == 608 || code == 1000) {
                callSuccess();
            }
        }).fail(callFailed);
    };

    var config = {
        miiee: {
            appkey: "2328604005",
            uid: "1644022571"       // 实际上该uid为tbtx
        },
        brand: {
            appkey: "2328604005",       // 暂时使用miiee的appkey
            uid: "2140361617"
        },
        tbtx: {
            uid: "1644022571"
        }
    };

    var shareToSinaWB = function(selecotr, title, url, pic, site, uid) {
        uid = uid || '';
        site = site || "miiee";
        pic = pic || '';
        url = url || window.location.href;
        title = title || $('meta[name="description"]').attr("content");

        var base = 'http://v.t.sina.com.cn/share/share.php?';
        var params = {
            appkey: config[site].appkey, // appkey
            url: url,
            title: title,
            ralateUid: uid || config[site].uid, // @user
            pic: pic
        };

        var link = base + $.param(params);
        $(selecotr).attr({
            href: link,
            target: "_blank"
        });
    };

    var addToFavourite = function(title, url) {
        url = url || document.location.href;
        title = title || document.title;

        var def = function() {
            alert('按下 ' + (navigator.userAgent.toLowerCase().indexOf('mac') != -1 ? 'Command/Cmd' : 'CTRL') + ' + D 来收藏本页.');
        };

        try {
            // Internet Explorer
            window.external.AddFavorite(url, title);
        } catch (e) {       // 两个e不要一样
            try {
                // Mozilla
                window.sidebar.addPanel(title, url, "");
            } catch (ex) {
                // Opera
                // 果断无视opera
                if (typeof(opera) == "object") {
                    def();
                    return true;
                } else {
                    // Unknown
                    def();
                }
            }
        }
    };


    tbtx.mix({
        miieeJSToken: miieeJSToken,
        userCheck: userCheck,

        shareToSinaWB: shareToSinaWB,
        addToFavourite: addToFavourite
    });
})(this, jQuery);
