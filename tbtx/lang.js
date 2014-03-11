(function(global, S, undefined) {
    // 语言扩展
    // 不依赖jQuery
    // 内部使用S，简化tbtx

    var AP = Array.prototype,
        OP = Object.prototype,
        SP = String.prototype,
        toString = OP.toString,
        FALSE = false,
        TRUE = true,
        EMPTY = '',
        class2type = {},

        /**
         * jQuery type()
         */
        type = function(obj) {
            return obj === null ?
                String(obj) :
                class2type[toString.call(obj)] || 'object';
        },

        /**
         * jQ的each在fn中参数顺序与forEach不同
         */
        each = function(object, fn, context) {
            if (object) {
                var key,
                    val,
                    keysArray,
                    i = 0,
                    length = object.length,
                    // do not use typeof obj == 'function': bug in phantomjs
                    isObj = length === undefined || type(object) == 'function';

                context = context || null;

                if (isObj) {
                    keysArray = keys(object);
                    for (; i < keysArray.length; i++) {
                        key = keysArray[i];
                        // can not use hasOwnProperty
                        if (fn.call(context, object[key], key, object) === FALSE) {
                            break;
                        }
                    }
                } else {
                    for (val = object[0]; i < length; val = object[++i]) {
                        if (fn.call(context, val, i, object) === FALSE) {
                            break;
                        }
                    }
                }
            }
            return object;
        },

        isString = function(val) {
            return type(val) === 'string';
        },

        isArray = Array.isArray || function(val) {
            return type(val) === 'array';
        },

        inArray = function(arr, item) {
            return indexOf(arr, item) > -1;
        },

        /**
         * 修正IE7以下字符串不支持下标获取字符
         */
        indexOf = AP.indexOf ?
            function(arr, item) {
                return arr.indexOf(item);
            } : function(arr, item) {
                var i;
                if (isString(arr)) {
                    for (i = 0; i < arr.length; i++) {
                        if (arr.charAt(i) === item) {
                            return i;
                        }
                    }
                } else {
                    for (i = 0; i < arr.length; i++) {
                        if (arr[i] === item) {
                            return i;
                        }
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
        keys = Object.keys ? function(o) {
            return Object.keys(o);
        } : function(o) {
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

        isPlainObject = function(obj) {
            // Must be an Object.
            // Because of IE, we also have to check the presence of the constructor property.
            // Make sure that Dom nodes and window objects don't pass through, as well
            if (!obj || type(obj) !== "object" || obj.nodeType || obj.window == obj) {
                return FALSE;
            }

            var key, objConstructor;

            try {
                // Not own constructor property must be Object
                if ((objConstructor = obj.constructor) && !hasOwnProperty(obj, "constructor") && !hasOwnProperty(objConstructor.prototype, "isPrototypeOf")) {
                    return FALSE;
                }
            } catch (e) {
                // IE8,9 Will throw exceptions on certain host objects
                return FALSE;
            }

            // Own properties are enumerated firstly, so to speed up,
            // if last one is own, then all properties are own.
            for (key in obj) {}

            return key === undefined || hasOwnProperty(obj, key);
        },

        makeArray = function(o) {
            if (o === null || !o) {
                return [];
            }
            if (isArray(o)) {
                return o;
            }
            var lengthType = typeof o.length,
                oType = typeof o;
            // The strings and functions also have 'length'
            if (lengthType !== 'number' ||
                // form.elements in ie78 has nodeName 'form'
                // then caution select
                // o.nodeName
                // window
                o.alert ||
                oType === 'string' ||
                // https://github.com/ariya/phantomjs/issues/11478
                (oType === 'function' && !( 'item' in o && lengthType === 'number'))) {
                return [o];
            }
            var ret = [];
            for (var i = 0, l = o.length; i < l; i++) {
                ret[i] = o[i];
            }
            return ret;
        },

        deepCopy = function(obj) {
            if(!obj || 'object' !== typeof obj) {
                return obj;
            }
            var o = obj.constructor === Array ? [] : {},
                i;

            for(i in obj){
                if(obj.hasOwnProperty(i)){
                    o[i] = typeof obj[i] === "object" ? deepCopy(obj[i]) : obj[i];
                }
            }
            return o;
        },

         /*
         * 返回m-n之间的随机数，并取整,
         * 包括m, 不包括n - floor, ceil相反
         * 也可以传入数组，随机返回数组某个元素
         */
        choice = function(m, n) {
            var array,
                random,
                temp;
            if (isArray(m)) {
                array = m;
                m = 0;
                n = array.length;
            }

            if (m > n) {
                temp = m;
                m = n;
                n = temp;
            }

            random = Math.floor(Math.random() * (n-m) + m);
            if (array) {
                return array[random];
            }
            return random;
        },

        /*
         * http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
         * 洗牌算法
         * 多次运行测试是否足够随机
         * test code: https://gist.github.com/4507739
         */
        shuffle = function(array) {
            if (!isArray(array)) {
                return [];
            }

            var length = array.length,
                temp,
                i = length,
                j;

            if (length === 0) {
                return [];
            }

            while (i > 1) {
                i = i - 1;
                j = choice(0, i);
                temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
            return array;
        },

        // oo实现
        Class = function(parent, properties) {
            if (!S.isFunction(parent)) {
                properties = parent;
                parent = null;
            }
            properties = properties || {};

            var klass = function() {
                if (parent) {
                    parent.apply(this, arguments);
                }
                if (this.constructor === klass && this.init) {
                    this.init.apply(this, arguments);
                }
            };

            if (parent) {
                // var subclass = function() {};
                // subclass.prototype = parent.prototype;
                // klass.prototype = new subclass();

                // or
                // mix(klass.prototype, parent.prototype);

                // 继承静态属性
                // mix(klass, parent);

                var proto = createProto(parent.prototype);
                mix(proto, klass.prototype);
                klass.prototype = proto;

                // ClassA.superclass.method显示调用父类方法
                klass.superclass = parent.prototype;
            }

            // klass.prototype.init = function() {}; // need to be overwrite
            klass.fn = klass.prototype;
            klass.fn.constructor = klass;

            mix(klass, Class.Mutators);
            klass.fn.proxy = klass.proxy;

            return klass.include(properties);
        },

        Now = Date.now || function() {
            return +new Date();
        },

        /**
         * 在underscore里面有实现，这个版本借鉴的是kissy
         */
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

        /**
         * 函数柯里化
         * 调用同样的函数并且传入的参数大部分都相同的时候，就是考虑柯里化的理想场景
         */
        curry = function(fn) {
            var slice = [].slice,
                args = slice.call(arguments, 1);

            return function() {
                var innerArgs = slice.call(arguments),
                    retArgs = args.concat(innerArgs);
                return fn.apply(null, retArgs);
            };
        },

        /**
         * {{ name }} -> {{ o[name] }}
         * \{{}} -> \{{}}
         * based on Django, fix kissy, support blank -> {{ name }}, not only {{name}}
         */
        substitute = function(str, o, regexp) {
            if (!S.isNotEmptyString(str)) {
                return str;
            }
            if ( !(isPlainObject(o) || isArray(o)) ) {
                return str;
            }
            return str.replace(regexp || /\\?\{\{\s*([^{}\s]+)\s*\}\}/g, function(match, name) {
                if (match.charAt(0) === '\\') {
                    return match.slice(1);
                }
                return (o[name] === undefined) ? '' : o[name];
            });
        },

        param = function (o, sep, eq, serializeArray) {
            sep = sep || '&';
            eq = eq || '=';
            if (serializeArray === undefined) {
                serializeArray = TRUE;
            }
            var buf = [], key, i, v, len, val,
                encode = encodeURIComponent;
            for (key in o) {
                val = o[key];
                key = encode(key);

                // val is valid non-array value
                if (isValidParamValue(val)) {
                    buf.push(key);
                    if (val !== undefined) {
                        buf.push(eq, encode(val + EMPTY));
                    }
                    buf.push(sep);
                } else if (S.isArray(val) && val.length) {
                    // val is not empty array
                    for (i = 0, len = val.length; i < len; ++i) {
                        v = val[i];
                        if (isValidParamValue(v)) {
                            buf.push(key, (serializeArray ? encode('[]') : EMPTY));
                            if (v !== undefined) {
                                buf.push(eq, encode(v + EMPTY));
                            }
                            buf.push(sep);
                        }
                    }
                }
                // ignore other cases, including empty array, Function, RegExp, Date etc.

            }

            buf.pop();
            return buf.join(EMPTY);
        },
        /**
         * query字符串转为对象
         */
        unparam = function(str, sep, eq) {
            if (!S.isNotEmptyString(str)) {
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
                        S.log(e + 'decodeURIComponent error : ' + val, 'error');
                    }
                }
                ret[key] = val;
            }
            return ret;
        },

        // from caja uri
        URI_RE = new RegExp(
            "^" +
            "(?:" +
            "([^:/?#]+)" + // scheme
            ":)?" +
            "(?://" +
            "(?:([^/?#]*)@)?" + // credentials
            "([^/?#:@]*)" + // domain
            "(?::([0-9]+))?" + // port
            ")?" +
            "([^?#]+)?" + // path
            "(?:\\?([^#]*))?" + // query
            "(?:#(.*))?" + // fragment
            "$"
        ),

        parseCache = new S.Cache("parseUrl"),

        /**
         * parse url
         * @param  {url}    url     the url to be parsed
         * @return {Object}         a object with url info
         */
        parseUrl = function(url) {
            var ret = {},
                match;
            url = url || location.href;

            var cache = parseCache.get(url);
            if (cache) {
                return cache;
            }

            if (!S.isNotEmptyString(url)) {
                return ret;
            }
            match = URI_RE.exec(url);
            if (match) {
                // 统一undefined为string
                each(match, function(item, index) {
                    if (!item) {
                        match[index] = "";
                    }
                });
                ret = {
                    scheme: match[1],
                    credentials: match[2],
                    domain: match[3],
                    port: match[4],
                    path: match[5],
                    query: match[6],
                    fragment: match[7]
                };
            }
            parseCache.set(url, ret);
            return ret;
        },
        getFragment = function(url) {
            return parseUrl(url).fragment;
        },
        getQueryParam = function(name, url) {
            if (S.isUri(name)) {
                url = name;
                name = "";
            }
            var parseResult = parseUrl(url),
                query = parseResult.query;
            if (S.isString(parseResult.query)) {
                query = unparam(query);
            }

            return name ? query[name] || "": query;
        },
        addQueryParam = function(name, value, url) {
            var input = {};
            if (isPlainObject(name)) {
                url = value;
                input = name;
            } else {
                input[name] = value;
            }
            var parseResult = parseUrl(url),
                query = parseResult.query;
            if (S.isString(query)) {
                query = unparam(parseResult.query);
            }

            parseResult.query = mix(query, input);
            return parseToUri(parseResult);
        },
        removeQueryParam = function(name, url) {
            name = S.isArray(name) ? name: [name];
            var parseResult = parseUrl(url),
                query = unparam(parseResult.query);

            each(name, function(item) {
                if (query[item]) {
                    delete query[item];
                }
            });
            parseResult.query = query;
            return parseToUri(parseResult);
        },
        // parseResult -> uri
        parseToUri = function(parseResult) {
            var ret = [parseResult.scheme, "://", parseResult.domain],
                t;

            t = parseResult.port;
            if (t) {
                ret.push(":" + t);
            }

            ret.push(parseResult.path);

            t = parseResult.query;
            if (typeof t == "object") {
                t = param(t);
            }
            if (t) {
                ret.push("?" + t);
            }

            t = parseResult.fragment;
            if (t) {
                ret.push("#" + t);
            }

            return ret.join("");
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
        getEscapeReg = function() {
            if (escapeReg) {
                return escapeReg;
            }
            var str = EMPTY;
            each(htmlEntities, function(entity, index) {
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
            each(reverseEntities, function(entity, index) {
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

    each("Boolean Number String Function Array Date RegExp Object".split(" "), function(name, lc) {
        class2type["[object " + name + "]"] = (lc =name.toLowerCase());
        S['is' + name] = function(o) {
            return type(o) === lc;
        };
    });
    S.isArray = Array.isArray || S.isArray;

    function hasOwnProperty(o, p) {
        return OP.hasOwnProperty.call(o, p);
    }

    // Shared empty constructor function to aid in prototype-chain creation.
    function Ctor() {}
    // See: http://jsperf.com/object-create-vs-new-ctor
    var createProto = Object.__proto__ ? function(proto) {
        return {
            __proto__: proto
        };
    } : function(proto) {
        Ctor.prototype = proto;
        return new Ctor();
    };

    Class.Mutators = {
        extend: function(object) {
            var extended = object.extended;

            mix(this, object, ['extended']);

            if (extended) {
                extended(this);
            }
            return this;
        },
        include: function(object) {
            var included = object.included;

            mix(this.prototype, object, ['included']);

            if (included) {
                included(this);
            }
            return this;
        },
        proxy: function(func) {
            var self = this;
            return (function() {
                return func.apply(self, arguments);
            });
        },
        Implements: Implements
    };
    function Implements(items) {
        if (!isArray(items)) {
            items = [items];
        }
        var proto = this.prototype || this,
            item = items.shift();
        while(item) {
            mix(proto, item.prototype || item, ['prototype']);
            item = items.shift();
        }
        return this;
    }
    function classify(cls) {
        cls.Implements = Implements;
        return cls;
    }
    function isValidParamValue(val) {
        var t = typeof val;
        // If the type of val is null, undefined, number, string, boolean, return TRUE.
        return val === null || (t !== 'object' && t !== 'function');
    }


    // ES5 15.5.4.20
    // whitespace from: http://es5.github.io/#x15.5.4.20
    var ws = "\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003" +
        "\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028" +
        "\u2029\uFEFF";
    if (!String.prototype.trim || ws.trim()) {
        // http://blog.stevenlevithan.com/archives/faster-trim-javascript
        // http://perfectionkills.com/whitespace-deviations/
        ws = "[" + ws + "]";
        var trimBeginRegexp = new RegExp("^" + ws + ws + "*"),
            trimEndRegexp = new RegExp(ws + ws + "*$");
        SP.trim = function () {
            if (this === void 0 || this === null) {
                throw new TypeError("can't convert "+this+" to object");
            }
            return String(this)
                .replace(trimBeginRegexp, "")
                .replace(trimEndRegexp, "");
        };
    }


    var mix = S.mix = function(des, source, blacklist, over, deep) {
        var i;
        if (!des || des === source) {
            return des;
        }
        // 扩展自身
        if (!source) {
            source = des;
            des = this;
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
                des[i] = deep ? deepCopy(source[i]) : source[i];
            }
        }
        return des;
    };

    // S
    S.mix({
        mix: mix,
        classify: classify,
        isNotEmptyString: function(val) {
            return isString(val) && val !== '';
        },

        trim: function(str) {
            return str.trim();
        },

        bind: function(fn, context) {
            if (arguments.length < 2 && context === undefined) {
                return fn;
            }

            var slice = [].slice,
                args = slice.call(arguments, 2);

            return function() {
                var innerArgs = slice.call(arguments, 0);
                return fn.apply(context, args.concat(innerArgs));
            };
        },

        isPlainObject: isPlainObject,
        /**
         * 判断jQuery deferred对象是否正在处理中
         * @param  {deferred object}
         * @return {Boolean}
         */
        isPending: function(val) {
            if (!val) {
                return FALSE;
            }
            // dark type
            if (val.resolve && val.promise) {
                return val.state() === "pending";
            }
            return FALSE;
        },

        isUri: function(val) {
            var match;
            if (S.isNotEmptyString(val)) {
                match = URI_RE.exec(val);
                if (match && match[1]) {
                    return TRUE;
                }
            }
            return FALSE;
        },

        /**
         * 单例模式
         * return only one instance
         * @param  {Function} fn      the function to return the instance
         * @param  {object}   context
         * @return {Function}
         */
        singleton: function(fn, context) {
            var result;
            return function() {
                return result || (result = fn.apply(context, arguments));
            };
        },

        // upercase str's first letter
        ucfirst: function(str) {
            return str.charAt(0).toUpperCase() + str.substring(1);
        },

        lcfirst: function(str) {
            return str.charAt(0).toLowerCase() + str.substring(1);
        },

        /**
         * [later description]
         * @param  {Function} fn       要执行的函数
         * @param  {number}   when     延迟时间
         * @param  {boolean}   periodic 是否周期执行
         * @param  {object}   context  context
         * @param  {Array}   data     传递的参数
         * @return {object}            timer，cancel and interval
         */
        later: function (fn, when, periodic, context, data) {
            when = when || 0;
            var m = fn,
                d = makeArray(data),
                f,
                r;

            if (typeof fn === 'string') {
                m = context[fn];
            }

            if (!m) {
                S.error('method undefined');
            }

            f = function () {
                m.apply(context, d);
            };

            r = (periodic) ? setInterval(f, when) : setTimeout(f, when);

            return {
                id: r,
                interval: periodic,
                cancel: function () {
                    if (this.interval) {
                        clearInterval(r);
                    } else {
                        clearTimeout(r);
                    }
                }
            };
        },
        inArray: inArray,
        type: type,
        each: each,
        indexOf: indexOf,

        filter: AP.filter ?
            function(arr, fn, context) {
                return AP.filter.call(arr, fn, context);
            } : function(arr, fn, context) {
                var ret = [];
                each(arr, function(item, i) {
                    if (fn.call(context || this, item, i, arr)) {
                        ret.push(item);
                    }
                });
                return ret;
            },

        map: AP.map ?
            function (arr, fn, context) {
                return AP.map.call(arr, fn, context || this);
            } : function (arr, fn, context) {
                var len = arr.length,
                    ret = new Array(len);
                for (var i = 0; i < len; i++) {
                    var el = typeof arr === 'string' ? arr.charAt(i) : arr[i];
                    if (el ||
                        //ie<9 in invalid when typeof arr == string
                        i in arr) {
                        ret[i] = fn.call(context || this, el, i, arr);
                    }
                }
                return ret;
            },

        every: AP.every ?
            function (arr, fn, context) {
                return AP.every.call(arr, fn, context || this);
            } :
            function (arr, fn, context) {
                var len = arr && arr.length || 0;
                for (var i = 0; i < len; i++) {
                    if (i in arr && !fn.call(context, arr[i], i, arr)) {
                        return FALSE;
                    }
                }
                return TRUE;
            },

        /**
         * Tests whether some element in the array passes the test implemented by the provided function.
         * @method
         * @param arr {Array} the array to iterate
         * @param callback {Function} the function to execute on each item
         * @param [context] {Object} optional context object
         * @member KISSY
         * @return {Boolean} whether some element in the array passes the test implemented by the provided function.
         */
        some: AP.some ?
            function (arr, fn, context) {
                return AP.some.call(arr, fn, context || this);
            } :
            function (arr, fn, context) {
                var len = arr && arr.length || 0;
                for (var i = 0; i < len; i++) {
                    if (i in arr && fn.call(context, arr[i], i, arr)) {
                        return TRUE;
                    }
                }
                return FALSE;
            },

        reduce: function(array, callback, initialValue) {
            var previous = initialValue,
                k = 0,
                length = array.length,
                dummy;

            if (typeof initialValue === "undefined") {
                previous = array[0];
                k = 1;
            }

            if (typeof callback === "function") {
                for (k; k < length; k++) {
                    dummy = array.hasOwnProperty(k) && (previous = callback(previous, array[k], k, array));
                }
            }
            return previous;
        },

        unique: function(arr) {
            var ret = [],
                i,
                hash = {};

            for (i = 0; i < arr.length; i++) {
                var item = arr[i];
                var key = typeof(item) + item;
                if (hash[key] !== 1) {
                    ret.push(item);
                    hash[key] = 1;
                }
            }

            return ret;
        },

        /**
         * return sizeof a str
         * 匹配双字节字符(包括汉字在内)
         * @param  {String} str the input str
         * @return {number}     the sizeof the str
         */
        sizeof: function(str) {
            return String(str).replace(/[^\x00-\xff]/g, "aa").length;
        },

        keys: keys,
        makeArray: makeArray,
        deepCopy: deepCopy,

        namespace: function () {
            var args = makeArray(arguments),
                l = args.length,
                o = this, i, j, p;

            for (i = 0; i < l; i++) {
                p = (EMPTY + args[i]).split('.');
                for (j = (global[p[0]] === o) ? 1 : 0; j < p.length; ++j) {
                    o = o[p[j]] = o[p[j]] || {};
                }
            }
            return o;
        },

        startsWith: function(str, prefix) {
            return str.lastIndexOf(prefix, 0) === 0;
        },


        endsWith: function(str, suffix) {
            var index = str.length - suffix.length;
            return index >= 0 && str.indexOf(suffix, index) == index;
        },

        choice: choice,
        shuffle: shuffle,
        Class: Class,
        Now: Now,
        throttle: throttle,
        curry: curry,
        substitute: substitute,
        unparam: unparam,
        param: param,
        parseUrl: parseUrl,
        getFragment: getFragment,
        getQueryParam: getQueryParam,
        addQueryParam: addQueryParam,
        removeQueryParam: removeQueryParam,
        escapeHtml: escapeHtml,
        unEscapeHtml: unEscapeHtml
    });
})(this, tbtx, undefined);
