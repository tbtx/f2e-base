/*
 * tbtx-base-js
 * update: 2014-04-28 10:12:42
 * shiyi_tbtx
 * tb_dongshuang.xiao@taobao.com
 */
(function(global, S) {

    var isSupportConsole = global.console && console.log,

        noop = function() {};

    S = global[S] = global[S] || {};

    mix(S, {

        /**
         * 在log环境下输出log信息，避免因为忘记删除log语句而引发错误
         * @param  {String} msg 消息
         * @param  {String} cat 类型，如error/info等，可选
         * @param  {String} src 消息来源，可选
         * @return {Object}     返回tbtx以链式调用，如tbtx.log().log()
         */
        log: isSupportConsole ? function(msg, cat, src) {
            if (src) {
                msg = src + ": " + msg;
            }
            console[cat && console[cat] ? cat : "log"](msg);

            return this;
        } : noop,

        /**
         * global对象，在浏览器环境中为window
         * @type {Object}
         */
        global: global,

        /**
         * 空函数，在需要使用空函数作为参数时使用
         */
        noop: noop,

        mix: mix

    });

    function mix(to, from) {
        if (!from) {
            from = to;
            to = S;
        }
        for (var i in from) {
            to[i] = from[i];
        }
        return to;
    }

})(this, "tbtx");


;(function(global, S, undefined) {
    // 语言扩展
    // 不依赖jQuery

    /*
     * shim first
     */
    var AP = Array.prototype,
        OP = Object.prototype,
        SP = String.prototype,
        FP = Function.prototype,
        toString = OP.toString,
        slice = AP.slice,
        hasOwn = OP.hasOwnProperty,
        TRUE = true,
        FALSE = false,
        shimType = "function",
        spliter = " ";

    /**
     * Object.keys
     */
    if (typeof Object.keys != shimType) {
        var hasEnumBug = !({
                toString: 1
            }["propertyIsEnumerable"]("toString")),
            enumProperties = [
                "constructor",
                "hasOwnProperty",
                "isPrototypeOf",
                "propertyIsEnumerable",
                "toString",
                "toLocaleString",
                "valueOf"
            ];

        Object.keys = function(o) {
            var ret = [],
                p,
                i;

            for (p in o) {
                ret.push(p);
            }
            if (hasEnumBug) {
                for (i = enumProperties.length - 1; i >= 0; i--) {
                    p = enumProperties[i];
                    if (hasOwnProperty(o, p)) {
                        ret.push(p);
                    }
                }
            }

            return ret;
        };
    }
    S.keys = Object.keys;

    if (typeof FP.bind != shimType) {
        FP.bind = function(context) {
            var args = slice.call(arguments, 1),
                self = this,
                noop = function() {},
                ret = function() {
                    // 已经bind过context, context还应该是this
                    return self.apply(this instanceof noop && context ? this : context, args.concat(slice.call(arguments)));
                };

            noop.prototype = this.prototype;
            ret.prototype = new noop();
            return ret;
        };
    }
    S.bind = function(fn, context) {
        return fn.bind(context);
    };

    /**
     * Date.now
     */
    if (typeof Date.now != shimType) {
        Date.now = function() {
            return +new Date();
        };
    }
    S.Now = Date.now;

    // ES5 15.5.4.20
    // whitespace from: http://es5.github.io/#x15.5.4.20
    // 所有可能的空白
    var ws = "\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003" +
        "\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028" +
        "\u2029\uFEFF";
    if (!SP.trim || ws.trim()) {
        // http://blog.stevenlevithan.com/archives/faster-trim-javascript
        // http://perfectionkills.com/whitespace-deviations/
        ws = "[" + ws + "]";
        var trimBeginRegexp = new RegExp("^" + ws + ws + "*"),
            trimEndRegexp = new RegExp(ws + ws + "*$");

        SP.trim = function() {
            return String(this)
                .replace(trimBeginRegexp, EMPTY)
                .replace(trimEndRegexp, EMPTY);
        };
    }
    S.trim = function(str) {
        return str.trim();
    };

    /*
     * array shim
     * Array.prototype.every
     * Array.prototype.filter
     * Array.prototype.forEach
     * Array.prototype.indexOf
     * Array.prototype.lastIndexOf
     * Array.prototype.map
     * Array.prototype.some
     * Array.prototype.reduce
     * Array.prototype.reduceRight
     * Array.isArray
     */

    if (typeof AP.forEach != shimType) {
        AP.forEach = function(fn, context) {
            var i = 0,
                length = this.length;

            for (; i < length; i++) {
                fn.call(context, this[i], i, this);
            }
        };
    }

    if (typeof AP.map != shimType) {
        AP.map = function(fn, context) {
            var ret = [],
                i = 0,
                length = this.length;

            for (; i < length; i++) {
                ret.push(fn.call(context, this[i], i, this));
            }
            return ret;
        };
    }

    if (typeof AP.filter != shimType) {
        AP.filter = function(fn, context) {
            var ret = [],
                i = 0,
                length = this.length,
                item;

            for (; i < length; i++) {
                item = this[i];
                if (fn.call(context, item, i, this)) {
                    ret.push(item);
                }
            }
            return ret;
        };
    }

    if (typeof AP.some != shimType) {
        AP.some = function(fn, context) {
            var i = 0,
                length = this.length;

            for (; i < length; i++) {
                if (fn.call(context, this[i], i, this)) {
                    return TRUE;
                }
            }
            return FALSE;
        };
    }

    if (typeof AP.every != shimType) {
        AP.every = function(fn, context) {
            var i = 0,
                length = this.length;

            for (; i < length; i++) {
                if (!fn.call(context, this[i], i, this)) {
                    return FALSE;
                }
            }
            return TRUE;
        };
    }

    if (typeof AP.indexOf != shimType) {
        AP.indexOf = function(searchElement, fromIndex) {
            var ret = -1,
                i,
                length = this.length;

            i = fromIndex * 1 || 0;
            i = i >= 0 ? i : Math.max(0, length + i);

            for (; i < length; i++) {
                if (this[i] === searchElement) {
                    return i;
                }
            }
            return ret;
        };
    }

    if (typeof AP.lastIndexOf != shimType) {
        AP.lastIndexOf = function(searchElement, fromIndex) {
            var ret = -1,
                length = this.length,
                i = length - 1;

            fromIndex = fromIndex * 1 || length - 1;
            i = Math.min(i, fromIndex);

            for (; i > -1; i--) {
                if (this[i] === searchElement) {
                    return i;
                }
            }
            return ret;
        };
    }

    if (typeof AP.reduce != shimType) {
        AP.reduce = function(fn, initialValue) {
            var previous = initialValue,
                i = 0,
                length = this.length;

            if (initialValue === undefined) {
                previous = this[0];
                i = 1;
            }

            for (; i < length; i++) {
                previous = fn(previous, this[i], i, this);
            }
            return previous;
        };
    }

    if (typeof AP.reduceRight != shimType) {
        AP.reduceRight = function(fn, initialValue) {
            var length = this.length,
                i = length - 1,
                previous = initialValue;

            if (initialValue === undefined) {
                previous = this[length - 1];
                i--;
            }
            for (; i > -1; i--) {
                previous = fn(previous, this[i], i, this);
            }
            return previous;
        };
    }

    "forEach map filter every some".split(spliter).forEach(function(name) {
        /**
         * iter object and array
         * only use when you want to iter both array and object, if only array, please use [].map/filter..
         * 要支持object, array, 以及array like object
         * @param  {Array/Object}   object      the object to iter
         * @param  {Function}       fn          the iter process fn
         * @return {Boolean/Array}              the process result
         */
        S[name] = function(object, fn, context) {
            if (!isArrayOrObject(object)) {
                return object;
            }

            if (isArray(object)) {
                return object[name](fn, context);
            } else {
                var keys = Object.keys(object),
                    values = keys.map(function(key) {
                        return object[key];
                    }),
                    result;

                var process = values[name](function(item, index) {
                    var key = keys[index];
                    var ret = fn.call(context, item, key, object);

                    if (name === "filter" && ret) {
                        result = result || {};
                        result[key] = item;
                    }
                    if (name === "map") {
                        result = result || {};
                        result[key] = ret;
                    }
                    return ret;
                });
                return result || process;
            }
        };
    });

    "reduce reduceRight".split(spliter).forEach(function(name) {
        S[name] = function(array, fn, initialValue) {
            if (initialValue === undefined) {
                return array[name](fn);
            }
            return array[name](fn, initialValue);
        };
    });

    "indexOf lastIndexOf".split(spliter).forEach(function(name) {
        S[name] = function(array, searchElement, fromIndex) {
            return array[name](searchElement, fromIndex);
        };
    });

    var class2type = {};
    "Boolean Number String Function Array Date RegExp Object".split(" ").forEach(function(name, lc) {
        class2type["[object " + name + "]"] = (lc = name.toLowerCase());
        S["is" + name] = function(o) {
            return type(o) === lc;
        };
    });

    var isArray = Array.isArray = S.isArray = Array.isArray || S.isArray,
        isFunction = S.isFunction,
        isObject = S.isObject,
        isString = S.isString;

    // return false终止循环
    // 原生every必须return true or false
    var each = S.each = function(object, fn, context) {
        if (object == null) {
            return object;
        }

        var i = 0,
            key,
            keys,
            length = object.length;

        context = context || null;

        if (length === +length) {
            for (; i < length; i++) {
                if (fn.call(context, object[i], i, object) === FALSE) {
                    break;
                }
            }
        } else {
            keys = Object.keys(object);
            length = keys.length;
            for (; i < length; i++) {
                key = keys[i];
                // can not use hasOwnProperty
                if (fn.call(context, object[key], key, object) === FALSE) {
                    break;
                }
            }
        }
    };

    var EMPTY = "",
        SEP = "&",
        EQ = "=",
        OR = "|",
        DOT = ".",

        /**
         * 单例模式
         * return only one instance
         * @param  {Function} fn      the function to return the instance
         * @param  {object}   context
         * @return {Function}
         */
        singleton = function(fn, context) {
            var result;
            return function() {
                return result || (result = fn.apply(context, arguments));
            };
        },

        /**
         * jQuery type()
         */
        type = function(obj) {
            return obj === null ?
                String(obj) :
                class2type[toString.call(obj)] || "object";
        },

        inArray = function(array, item) {
            return array.indexOf(item) > -1;
        },

        isWindow = function(obj) {
            return obj != null && obj == obj.window;
        },

        isPlainObject = function(obj) {
            // Must be an Object.
            // Because of IE, we also have to check the presence of the constructor property.
            // Make sure that Dom nodes and window objects don't pass through, as well
            if (!obj || !isObject(obj) || obj.nodeType || isWindow(obj)) {
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
            var ret = [];

            if (o == null) {
                return ret;
            }
            if (isArray(o)) {
                return o;
            }
            var lengthType = typeof o.length,
                oType = typeof o;

            if(lengthType !== "number" || typeof o.nodeName === "string" || o != null && o == o.window || oType === "string" || oType === "function" && !("item" in o && lengthType === "number")) {
                return [o];
            }
            for (var i = 0, l = o.length; i < l; i++) {
                ret[i] = o[i];
            }
            return ret;
        },

        deepCopy = function(obj) {
            if (isArrayOrObject(obj)) {
                return S.extend(true, {}, obj);
            }
            return obj;
        },

        htmlEntities = {
            "&amp;": "&",
            "&gt;": ">",
            "&lt;": "<",
            "&#x60;": "`",
            "&#x2F;": "/",
            "&quot;": '"',
            "&#x27;": "'"
        },
        reverseEntities = {},
        getEscapeReg = singleton(function() {
            var str = EMPTY;
            each(htmlEntities, function(entity, index) {
                str += entity + OR;
            });
            str = str.slice(0, -1);
            return new RegExp(str, "g");
        }),
        getUnEscapeReg = singleton(function() {
            var str = EMPTY;
            each(reverseEntities, function(entity, index) {
                str += entity + OR;
            });
            str += "&#(\\d{1,5});";

            return new RegExp(str, "g");
        }),
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

    for (var k in htmlEntities) {
        reverseEntities[htmlEntities[k]] = k;
    }

    /**
     * util
     */

    function hasOwnProperty(o, p) {
        return hasOwn.call(o, p);
    }

    function isValidParamValue(val) {
        var t = typeof val;
        // If the type of val is null, undefined, number, string, boolean, return TRUE.
        return val === null || (t !== "object" && t !== "function");
    }
    function isArrayOrObject(val) {
        return val && "object" === typeof val;
    }

    // S
    S.mix({

        isNotEmptyString: function(val) {
            return isString(val) && val !== EMPTY;
        },

        isEmptyObject: function(o) {
            return Object.keys(o).length === 0;
        },

        pluck: function(object, name) {
            var names = name.split(DOT);
            return S.map(object, function(v, k, object) {
                var i = 0,
                    length = names.length;

                for (; i < length; i++) {
                    v = v[names[i]];
                }
                return v;
            });
        },

        result: function(val, context) {
            if (val == null) {
                return void 0;
            }
            return S.isFunction(val) ? val.call(context) : val;
        },

        extend: function() {
            var src, copyIsArray, copy, name, options, clone,
                target = arguments[0] || {},
                i = 1,
                length = arguments.length,
                deep = false;

            // Handle a deep copy situation
            if (typeof target === "boolean") {
                deep = target;

                // skip the boolean and the target
                target = arguments[i] || {};
                i++;
            }

            // Handle case when target is a string or something (possible in deep copy)
            if (typeof target !== "object" && !isFunction(target)) {
                target = {};
            }

            // extend itself if only one argument is passed
            if (i === length) {
                target = this;
                i--;
            }

            for (; i < length; i++) {
                // Only deal with non-null/undefined values
                if ((options = arguments[i]) != null ) {
                    // Extend the base object
                    for (name in options) {
                        src = target[name];
                        copy = options[name];

                        // Prevent never-ending loop
                        if (target === copy) {
                            continue;
                        }

                        // Recurse if we're merging plain objects or arrays
                        if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
                            if (copyIsArray) {
                                copyIsArray = false;
                                clone = src && isArray(src) ? src : [];

                            } else {
                                clone = src && isPlainObject(src) ? src : {};
                            }

                            // Never move original objects, clone them
                            target[name] = S.extend(deep, clone, copy);

                        // Don't bring in undefined values
                        } else if (copy !== undefined) {
                            target[name] = copy;
                        }
                    }
                }
            }

            // Return the modified object
            return target;
        },

        isWindow: isWindow,

        isPlainObject: isPlainObject,

        inArray: inArray,

        type: type,

        makeArray: makeArray,

        deepCopy: deepCopy,

        /**
         * [later description]
         * @param  {Function} fn       要执行的函数
         * @param  {number}   when     延迟时间
         * @param  {boolean}   periodic 是否周期执行
         * @param  {object}   context  context
         * @param  {Array}   data     传递的参数
         * @return {object}            timer，cancel and interval
         */
        later: function(fn, when, periodic, context, data) {
            when = when || 0;
            var m = fn,
                d = makeArray(data),
                f,
                r;

            if (typeof fn === "string") {
                m = context[fn];
            }

            if (!m) {
                S.log("method undefined", "error", "later");
            }

            f = function() {
                m.apply(context, d);
            };

            r = (periodic) ? setInterval(f, when) : setTimeout(f, when);

            return {
                id: r,
                interval: periodic,
                cancel: function() {
                    if (this.interval) {
                        clearInterval(r);
                    } else {
                        clearTimeout(r);
                    }
                }
            };
        },

        singleton: singleton,

        unique: function(array) {
            var hash = {};

            return array.filter(function(item) {
                var key = typeof(item) + item;
                if (hash[key] !== 1) {
                    hash[key] = 1;
                    return TRUE;
                }
                return FALSE;
            });
        },

        namespace: function() {
            var args = makeArray(arguments),
                l = args.length,
                o = this,
                i, j, p;

            for (i = 0; i < l; i++) {
                p = (EMPTY + args[i]).split(DOT);
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

        /**
         * 在underscore里面有实现，这个版本借鉴的是kissy
         */
        throttle: function(fn, ms, context) {
            context = context || this;
            ms = ms || 150;

            if (ms === -1) {
                return function() {
                    fn.apply(context, arguments);
                };
            }

            var last = Date.now();

            return function() {
                var now = Date.now();
                if (now - last > ms) {
                    last = now;
                    fn.apply(context, arguments);
                }
            };
        },

        debounce: function(fn, ms, context) {
            context = context || this;
            ms = ms || 150;

            if(ms === -1) {
                return function() {
                    fn.apply(context, arguments);
                };
            }
            var timer = null;
            var f = function() {
                f.stop();
                timer = S.later(fn, ms, 0, context, arguments);
            };
            f.stop = function() {
                if(timer) {
                    timer.cancel();
                    timer = 0;
                }
            };
            return f;
        },

        /**
         * {{ name }} -> {{ o[name] }}
         * \{{}} -> \{{}}
         * based on Django, fix kissy, support blank -> {{ name }}, not only {{name}}
         */
        substitute: function(str, o, regexp) {
            if (!S.isNotEmptyString(str)) {
                return str;
            }
            if (!(isPlainObject(o) || isArray(o))) {
                return str;
            }
            return str.replace(regexp || /\\?\{\{\s*([^{}\s]+)\s*\}\}/g, function(match, name) {
                if (match.charAt(0) === '\\') {
                    return match.slice(1);
                }
                return (o[name] === undefined) ? EMPTY : o[name];
            });
        },

        param: function(o, sep, eq, serializeArray) {
            sep = sep || SEP;
            eq = eq || EQ;
            if (serializeArray === undefined) {
                serializeArray = TRUE;
            }
            var buf = [],
                key, i, v, len, val,
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
                } else if (isArray(val) && val.length) {
                    // val is not empty array
                    for (i = 0, len = val.length; i < len; ++i) {
                        v = val[i];
                        if (isValidParamValue(v)) {
                            buf.push(key, (serializeArray ? encode("[]") : EMPTY));
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
        unparam: function(str, sep, eq) {
            if (!S.isNotEmptyString(str)) {
                return {};
            }
            sep = sep || SEP;
            eq = eq || EQ;

            var ret = {},
                eqIndex,
                decode = decodeURIComponent,
                pairs = str.split(sep),
                key, val,
                i = 0,
                len = pairs.length;

            for (; i < len; ++i) {
                eqIndex = pairs[i].indexOf(eq);
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
                        S.log(e + "decodeURIComponent error : " + val, "error", "unparam");
                    }
                }
                ret[key] = val;
            }
            return ret;
        },

        escapeHtml: escapeHtml,

        unEscapeHtml: unEscapeHtml
    });

})(this, tbtx);


;(function(S, undefined) {

    var TRUE = true,
        FALSE = false,
        EMPTY = "",
        each = S.each,
        param = S.param,
        unparam = S.unparam;

    var urlEncode = function (s) {
            return encodeURIComponent(String(s));
        },
        urlDecode = function (s) {
            return decodeURIComponent(s.replace(/\+/g, " "));
        };

    var Query = S.Query = function(query) {
        this._query = query || EMPTY;
        this._queryMap = unparam(this._query);
    };

    Query.prototype = {

        /**
         * Return parameter value corresponding to current key
         * @param {String} [key]
         */
        get: function (key) {
            var _queryMap = this._queryMap;
            if (key) {
                return _queryMap[key];
            } else {
                return S.deepCopy(_queryMap);
            }
        },

        /**
         * Parameter names.
         * @return {String[]}
         */
        keys: function () {
            return S.keys(this._queryMap);
        },

        /**
         * Set parameter value corresponding to current key
         * @param {String} key
         * @param value
         * @chainable
         */
        set: function (key, value) {
            var _queryMap = this._queryMap;
            if (typeof key === "string") {
                this._queryMap[key] = value;
            } else {
                if (key instanceof Query) {
                    key = key.get();
                }
                each(key, function (v, k) {
                    _queryMap[k] = v;
                });
            }
            return this;
        },

        /**
         * Remove parameter with specified name.
         * @param {String} key
         * @chainable
         */
        remove: function (key) {
            if (key) {
                delete this._queryMap[key];
            } else {
                this._queryMap = {};
            }
            return this;

        },

        /**
         * Add parameter value corresponding to current key
         * @param {String} key
         * @param value
         * @chainable
         */
        add: function (key, value) {
            var _queryMap = this._queryMap,
                currentValue;
            if (typeof key === "string") {
                currentValue = _queryMap[key];
                if (currentValue === undefined) {
                    currentValue = value;
                } else {
                    currentValue = [].concat(currentValue).concat(value);
                }
                _queryMap[key] = currentValue;
            } else {
                if (key instanceof Query) {
                    key = key.get();
                }
                for (var k in key) {
                    this.add(k, key[k]);
                }
            }
            return this;
        },

        /**
         * Serialize query to string.
         * @param {Boolean} [serializeArray=true]
         * whether append [] to key name when value 's type is array
         */
        toString: function (serializeArray) {
            return param(this._queryMap, undefined, undefined, serializeArray);
        }

    };


    // from caja uri
    var URI_RE = new RegExp(
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
        REG_INFO = {
            scheme: 1,
            credentials: 2,
            domain: 3,
            port: 4,
            path: 5,
            query: 6,
            fragment: 7
        };

    var Uri = S.Uri = function(uriStr) {
        var components,
            self = this;

        S.mix(self, {
            scheme: EMPTY,
            credentials: EMPTY,
            domain: EMPTY,
            port: EMPTY,
            path: EMPTY,
            query: EMPTY,
            fragment: EMPTY
        });

        components = Uri.getComponents(uriStr);

        each(components, function (v, key) {
            if (key === "query") {
                // need encoded content
                self.query = new Query(v);
            } else {
                // https://github.com/kissyteam/kissy/issues/298
                try {
                    v = urlDecode(v);
                } catch (e) {
                    S.log(e + "urlDecode error : " + v, "error", "Uri");
                }
                // need to decode to get data structure in memory
                self[key] = v;
            }
        });

        return self;
    };

    Uri.prototype = {

        getFragment: function () {
            return this.fragment;
        },

        toString: function (serializeArray) {
            var out = [],
                self = this,
                scheme = self.scheme,
                domain = self.domain,
                path = self.path,
                port = self.port,
                fragment = self.fragment,
                query = self.query.toString(serializeArray),
                credentials = self.credentials;

            if (scheme) {
                out.push(scheme);
                out.push(":");
            }

            if (domain) {
                out.push("//");
                if (credentials) {
                    out.push(credentials);
                    out.push("@");
                }

                out.push(encodeURIComponent(domain));

                if (port) {
                    out.push(":");
                    out.push(port);
                }
            }

            if (path) {
                out.push(path);
            }

            if (query) {
                out.push("?");
                out.push(query);
            }

            if (fragment) {
                out.push("#");
                out.push(fragment);
            }

            return out.join(EMPTY);
        }
    };

    Uri.getComponents = function (url) {
        url = url || location.href;

        var m,
            ret = {};

        if (!S.isNotEmptyString(url)) {
            return ret;
        }

        m = url.match(URI_RE) || [];

        each(REG_INFO, function(index, key) {
            ret[key] = m[index] || EMPTY;
        });
        return ret;
    };

    S.mix({
        urlEncode: urlEncode,
        urlDecode: urlDecode,

        isUri: function(val) {
            var match;
            if (S.isNotEmptyString(val)) {
                match = URI_RE.exec(val);
                return match && match[1];
            }
            return FALSE;
        },

        parseUrl: Uri.getComponents,

        getFragment: function(url) {
            return new Uri(url).getFragment();
        },
        getQueryParam: function(name, url) {
            if (S.isUri(name)) {
                url = name;
                name = EMPTY;
            }
            var uri = new Uri(url);
            return uri.query.get(name) || EMPTY;
        },
        addQueryParam: function(name, value, url) {
            var input = {};
            if (S.isPlainObject(name)) {
                url = value;
                input = name;
            } else {
                input[name] = value;
            }
            var uri = new Uri(url);
            uri.query.add(input);

            return uri.toString();
        },
        removeQueryParam: function(name, url) {
            name = S.makeArray(name);
            var uri = new Uri(url);

            name.forEach(function(item) {
                uri.query.remove(item);
            });
            return uri.toString();
        }

    });

})(tbtx);

;(function(global, S, undefined) {

    var Loader = S.namespace("Loader"),
        data = Loader.data = {};

    var isObject = S.isObject,
        isString = S.isString,
        isArray = Array.isArray,
        noop = S.noop,
        isFunction = S.isFunction;

    var _cid = 0;
    function cid() {
        return _cid++;
    }

    // path
    var DIRNAME_RE = /[^?#]*\//;
    // Extract the directory portion of a path
    // dirname("a/b/c.js?t=123#xx/zz") ==> "a/b/"
    // ref: http://jsperf.com/regex-vs-split/2

    function dirname(path) {
        return path.match(DIRNAME_RE)[0];
    }

    var DOT_RE = /\/\.\//g;
    var DOUBLE_DOT_RE = /\/[^/]+\/\.\.\//;
    var DOUBLE_SLASH_RE = /([^:/])\/\//g;

    // Canonicalize a path
    // realpath("http://test.com/a//./b/../c") ==> "http://test.com/a/c"

    function realpath(path) {
        // /a/b/./c/./d ==> /a/b/c/d
        path = path.replace(DOT_RE, "/");

        // a/b/c/../../d  ==>  a/b/../d  ==>  a/d
        while (path.match(DOUBLE_DOT_RE)) {
            path = path.replace(DOUBLE_DOT_RE, "/");
        }

        // a//b/c  ==>  a/b/c
        path = path.replace(DOUBLE_SLASH_RE, "$1/");

        return path;
    }

    // Normalize an id
    // normalize("path/to/a") ==> "path/to/a.js"
    // NOTICE: substring is faster than negative slice and RegExp

    function normalize(path) {
        var last = path.length - 1;
        var lastC = path.charAt(last);

        // If the uri ends with `#`, just return it without '#'
        if (lastC === "#") {
            return path.substring(0, last);
        }

        return (path.substring(last - 2) === ".js" ||
            path.indexOf("?") > 0 ||
            path.substring(last - 3) === ".css" ||
            lastC === "/") ? path : path + ".js";
    }


    var PATHS_RE = /^([^/:]+)(\/.+)$/;
    var VARS_RE = /{([^{]+)}/g;

    function parseAlias(id) {
        var alias = data.alias;
        return alias && isString(alias[id]) ? alias[id] : id;
    }

    function parsePaths(id) {
        var paths = data.paths;
        var m;

        if (paths && (m = id.match(PATHS_RE)) && isString(paths[m[1]])) {
            id = paths[m[1]] + m[2];
        }

        return id;
    }

    function parseVars(id) {
        var vars = data.vars;

        if (vars && id.indexOf("{") > -1) {
            id = id.replace(VARS_RE, function(m, key) {
                return isString(vars[key]) ? vars[key] : m;
            });
        }

        return id;
    }

    function parseMap(uri) {
        var map = data.map;
        var ret = uri;

        if (map) {
            for (var i = 0, len = map.length; i < len; i++) {
                var rule = map[i];

                ret = isFunction(rule) ?
                    (rule(uri) || uri) :
                    uri.replace(rule[0], rule[1]);

                // Only apply the first matched rule
                if (ret !== uri) break;
            }
        }

        return ret;
    }


    var ABSOLUTE_RE = /^\/\/.|:\//;
    var ROOT_DIR_RE = /^.*?\/\/.*?\//;

    function addBase(id, refUri) {
        var ret;
        var first = id.charAt(0);

        // Absolute
        if (ABSOLUTE_RE.test(id)) {
            ret = id;
        }
        // Relative
        else if (first === ".") {
            ret = realpath((refUri ? dirname(refUri) : data.cwd) + id);
        }
        // Root
        else if (first === "/") {
            var m = data.cwd.match(ROOT_DIR_RE);
            ret = m ? m[0] + id.substring(1) : id;
        }
        // Top-level
        else {
            ret = data.base + id;
        }

        if (ret.indexOf("//") === 0) {
            ret = location.protocol + ret;
        }

        return ret;
    }

    function id2Uri(id, refUri) {
        if (!id) return "";

        id = parseAlias(id);
        id = parsePaths(id);
        id = parseVars(id);
        id = normalize(id);

        var uri = addBase(id, refUri);
        uri = parseMap(uri);

        return uri;
    }

    var doc = document;
    // @update 神经病document.URL 和location.href
    var cwd = dirname(location.href);
    var scripts = doc.scripts;

    var loaderScript = scripts[scripts.length - 1];

    // When `sea.js` is inline, set loaderDir to current working directory
    var loaderDir = dirname(getScriptAbsoluteSrc(loaderScript) || cwd);

    function getScriptAbsoluteSrc(node) {
        return node.hasAttribute ? // non-IE6/7
        node.src :
        // see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
        node.getAttribute("src", 4);
    }

    Loader.resolve = id2Uri;

    /**
     * util-request.js - The utilities for requesting script and style files
     * ref: tests/research/load-js-css/test.html
     */

    var head = doc.head || doc.getElementsByTagName("head")[0] || doc.documentElement;
    var baseElement = head.getElementsByTagName("base")[0];

    // 当前正在加载的script
    var currentlyAddingScript;
    var interactiveScript;

    var IS_CSS_RE = /\.css(?:\?|$)/i;
    var isOldWebKit = +navigator.userAgent
        .replace(/.*(?:AppleWebKit|AndroidWebKit)\/(\d+).*/, "$1") < 536;

    function request(url, callback, charset) {
        callback = callback || noop;

        var isCSS = IS_CSS_RE.test(url),
            node = doc.createElement(isCSS ? "link" : "script");

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
        }
        else {
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
        var supportOnload = "onload" in node;
        // for Old WebKit and Old Firefox
        if (isCSS && (isOldWebKit || !supportOnload)) {
            setTimeout(function() {
              pollCss(node, callback);
            }, 1); // Begin after node insertion
            return;
        }

        var onload = function() {
            // Ensure only run once and handle memory leak in IE
            node.onload = node.onerror = node.onreadystatechange = null;

            if(!isCSS) {
                head.removeChild(node);
            }

            // Dereference the node
            node = null;
            callback();
        };

        if (supportOnload) {
            node.onload = onload;
            node.onerror = function(error) {
                S.log(error, "error", "request " + isCSS ? "css" : "js");
                onload();
            };
        } else {
            node.onreadystatechange = function() {
                if (/loaded|complete/.test(node.readyState)) {
                    onload();
                }
            };
        }
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

    function getCurrentScript() {
        // @update
        if (doc.currentScript) {
            return doc.currentScript;
        }
        if (currentlyAddingScript) {
            return currentlyAddingScript;
        }

        // For IE6-9 browsers, the script onload event may not fire right
        // after the script is evaluated. Kris Zyp found that it
        // could query the script nodes and the one that is in "interactive"
        // mode indicates the current script
        // ref: http://goo.gl/JHfFW
        if (interactiveScript && interactiveScript.readyState === "interactive") {
            return interactiveScript;
        }

        var scripts = head.getElementsByTagName("script");

        for (var i = scripts.length - 1; i >= 0; i--) {
            var script = scripts[i];
            if (script.readyState === "interactive") {
                interactiveScript = script;
                return interactiveScript;
            }
        }
    }

    /**
     * module.js - The core of module loader
     */

    var cachedMods = Loader.cache = {};
    var anonymousMeta;

    var fetchingList = {};
    var fetchedList = {};
    var callbackList = {};

    var STATUS = Module.STATUS = {
        // 1 - The `module.uri` is being fetched
        FETCHING: 1,
        // 2 - The meta data has been saved to cachedMods
        SAVED: 2,
        // 3 - The `module.dependencies` are being loaded
        LOADING: 3,
        // 4 - The module are ready to execute
        LOADED: 4,
        // 5 - The module is being executed
        EXECUTING: 5,
        // 6 - The `module.exports` is available
        EXECUTED: 6
    };

    function Module(uri, deps) {
        this.uri = uri;
        this.dependencies = deps || [];
        this.exports = null;
        this.status = 0;

        // Who depends on me
        this._waitings = {};

        // The number of unloaded dependencies
        // 未加载的依赖数
        this._remain = 0;
    }

    Module.prototype = {
        // Resolve module.dependencies
        // 返回依赖模块的uri数组
        resolve: function() {
            var mod = this;
            var ids = mod.dependencies;
            var uris = [];

            for (var i = 0, len = ids.length; i < len; i++) {
                uris[i] = Module.resolve(ids[i], mod.uri);
            }
            return uris;
        },

        // Load module.dependencies and fire onload when all done
        load: function() {
            var mod = this;

            // If the module is being loaded, just wait it onload call
            if (mod.status >= STATUS.LOADING) {
                return;
            }

            mod.status = STATUS.LOADING;

            var uris = mod.resolve();

            // 未加载的依赖数
            var len = mod._remain = uris.length;
            var m;

            // Initialize modules and register waitings
            for (var i = 0; i < len; i++) {
                m = Module.get(uris[i]);

                if (m.status < STATUS.EXECUTED) {
                    // Maybe duplicate
                    m._waitings[mod.uri] = (m._waitings[mod.uri] || 0) + 1;
                } else {
                    mod._remain--;
                }
            }

            if (mod._remain === 0) {
                mod.onload();
                return;
            }

            for (i = 0; i < len; i++) {
                m = cachedMods[uris[i]];

                // 模块尚未define及加载
                if (m.status < STATUS.FETCHING) {
                    m.fetch();
                }
                // 模块define过
                else if (m.status === STATUS.SAVED) {
                    m.load();
                }
            }

            // Send all requests at last to avoid cache bug in IE6-9. Issues#808
            // for (var requestUri in requestCache) {
            //     if (requestCache.hasOwnProperty(requestUri)) {
            //         requestCache[requestUri]();
            //     }
            // }
        },

        onload: function() {
            var mod = this;
            mod.status = STATUS.LOADED;
            if (mod.callback) {
                mod.callback();
            }

            mod.exec();

            // Notify waiting modules to fire onload
            var waitings = mod._waitings;
            var uri, m;

            for (uri in waitings) {
                if (waitings.hasOwnProperty(uri)) {
                    m = cachedMods[uri];
                    m._remain -= waitings[uri];
                    if (m._remain === 0) {
                        m.onload();
                    }
                }
            }

            // Reduce memory taken
            delete mod._waitings;
            delete mod._remain;
        },

        // exec to get exports
        exec: function() {
            var mod = this;

            // When module is executed, DO NOT execute it again. When module
            // is being executed, just return `module.exports` too, for avoiding
            // circularly calling
            if (mod.status >= STATUS.EXECUTING) {
                return mod.exports;
            }

            mod.status = STATUS.EXECUTING;
            var uri = mod.uri;

            var uris = mod.resolve();
            var deps = [];
            for (var i = 0, len = uris.length; i < len; i++) {
                deps[i] = Module.get(uris[i]).exports;
            }

            // Exec factory
            var factory = mod.factory;

            var exports = isFunction(factory) ?
                factory.apply(null, deps) :
                factory;

            if (exports === undefined) {
                exports = mod.exports;
            }

            if (exports === null) {

            }

            // Reduce memory leak
            delete mod.factory;

            mod.exports = exports;
            mod.status = STATUS.EXECUTED;

            // Emit `exec` event
            // emit("exec", mod)

            return exports;
        },

        fetch: function() {
            var mod = this;
            var uri = mod.uri;

            mod.status = STATUS.FETCHING;

            // Empty uri or a non-CMD module
            if (!uri || fetchedList[uri]) {
                mod.load();
                return;
            }

            if (fetchingList[uri]) {
                callbackList[uri].push(mod);
                return;
            }

            fetchingList[uri] = true;
            callbackList[uri] = [mod];


            sendRequest();

            function sendRequest() {
                request(uri, onRequest, data.charset);
            }


            function onRequest() {
                delete fetchingList[uri];
                fetchedList[uri] = true;

                // Save meta data of anonymous module
                if (anonymousMeta) {
                    Module.save(uri, anonymousMeta);
                    anonymousMeta = null;
                }

                // Call callbacks
                var m, mods = callbackList[uri];
                delete callbackList[uri];
                while ((m = mods.shift())) m.load();
            }
        }
    };

    // Save meta data to cachedMods
    Module.save = function(uri, meta) {
        var mod = Module.get(uri);

        // Do NOT override already saved modules
        if (mod.status < STATUS.SAVED) {
            mod.id = meta.id || uri;
            mod.dependencies = meta.deps || [];
            mod.factory = meta.factory;
            mod.status = STATUS.SAVED;
        }
    };

    Module.get = function(uri, deps) {
        return cachedMods[uri] || (cachedMods[uri] = new Module(uri, deps));
    };
    // 不直接调用Module.require, 在其他地方使用并传入uri
    // Use function is equal to load a anonymous module
    Module.require = function(ids, callback, uri) {
        // 匿名模块uri根据preload，require等+cid进行区分
        // 需要uri来创建模块，注册依赖
        var mod = Module.get(uri, isArray(ids) ? ids : [ids]);

        // 注册模块完成时的callback
        // 获取依赖模块的export并且执行callback
        mod.callback = function() {
            var exports = [];
            var uris = mod.resolve();

            for (var i = 0, len = uris.length; i < len; i++) {
                exports[i] = cachedMods[uris[i]].exports;
            }

            if (callback) {
                callback.apply(global, exports);
            }

            delete mod.callback;
        };

        mod.load();
    };

    // Resolve id to uri
    Module.resolve = function(id, refUri) {
        return id2Uri(id, refUri);
    };

    Module.register = function(id, exports) {
        var uri = Module.resolve(id),
            mod = Module.get(uri);

        mod.id = id || uri;
        if (exports) {
            mod.exports = exports;
        }
        mod.status = STATUS.EXECUTED;
    };

    /**
     * define
     * 匿名模块与非匿名模块
     * 非匿名模块调用module.save保存模块信息。模块状态变为SAVED
     */
    Module.define = function(id, deps, factory) {
        var argsLen = arguments.length;

        // define(factory)
        if (argsLen === 1) {
            factory = id;
            id = undefined;
        } else if (argsLen === 2) {
            factory = deps;

            // define(deps, factory)
            if (isArray(id)) {
                deps = id;
                id = undefined;
            }
            // define(id, factory)
            else {
                deps = undefined;
            }
        }

        if (!isArray(deps)) {
            deps = [];
        }

        var meta = {
            id: id,
            uri: Module.resolve(id),
            deps: deps,
            factory: factory
        };

        // Try to derive uri in IE6-9 for anonymous modules
        if (!meta.uri) {
            var script = getCurrentScript();
            if (script) {
                meta.uri = script.src;
            }

            // NOTE: If the id-deriving methods above is failed, then falls back
            // to use onload event to get the uri
        }

        if (meta.uri) {
            Module.save(meta.uri, meta);
        } else {
            // Save information for "saving" work in the script onload event
            anonymousMeta = meta;
        }
    };
    Module.define.amd = {};

    /**
     * config.js - The configuration for the loader
     */

    // The root path to use for id2uri parsing
    // If loaderUri is `http://test.com/libs/seajs/[??][seajs/1.2.3/]sea.js`, the
    // baseUri should be `http://test.com/libs/`
    // 请求的baseUrl
    data.base = loaderDir;

    // The loader directory
    // loader所在目录，base默认是这个
    data.dir = loaderDir;

    // The current working directory
    data.cwd = cwd;

    // The charset for requesting files
    data.charset = "utf-8";

    // data.alias - An object containing shorthands of module id
    // data.paths - An object containing path shorthands in module id
    // data.vars - The {xxx} variables in module id
    // data.map - An array containing rules to map module uri
    // data.debug - Debug mode. The default value is false

    Loader.config = function(configData) {

        for (var key in configData) {
            var curr = configData[key];
            var prev = data[key];

            // Merge object config such as alias, vars
            if (prev && isObject(prev)) {
                for (var k in curr) {
                    prev[k] = curr[k];
                }
            } else {
                // Concat array config such as map, preload
                if (isArray(prev)) {
                    curr = prev.concat(curr);
                }
                // Make sure that `data.base` is an absolute path
                else if (key === "base") {
                    if (curr.slice(-1) !== "/") {
                        curr += "/";
                    }
                    curr = addBase(curr);
                }

                // Set config
                data[key] = curr;
            }
        }
    };


    global.define = S.define = Module.define;

    S.require = function(ids, callback) {
        Module.require(ids, callback, data.cwd + "_require_" + cid());
        return S;
    };

    S.register = Module.register;

    S.realpath = realpath;

    S.request = request;

})(this, tbtx);


;(function(S) {
    var realpath = S.realpath,
        register = S.register,
        global = S.global,
        Loader = S.Loader,
        data = Loader.data;

    var loaderDir = data.dir,
        staticUrl = S.staticUrl = realpath(loaderDir + "../../../");

    /**
     * paths config
     */
    var paths = {};

    ["dist", "plugin", "gallery", "component"].forEach(function(name) {
        paths[name] = loaderDir + name;
    });

    paths.arale = loaderDir + "dist/arale";


    Loader.config({
        base: staticUrl,

        alias: {
            // arale
            "base": "arale/base/1.1.1/base",
            "widget": "arale/widget/1.1.1/widget",
            "position": "arale/position/1.0.1/position",
            "detector": "arale/detector/1.3.0/detector",

            // dist

            // component
            "overlay": "component/overlay/1.1.4/overlay",
            "popup": "component/popup/1.0.0/popup",
            "switchable": "component/switchable/1.0.3/switchable",
            "validator": "component/validator/0.9.7/validator",

            // gallery
            "$": "gallery/jquery/1.8.3/jquery.min",
            "jquery": "gallery/jquery/1.8.3/jquery.min",
            "handlebars": "gallery/handlebars/1.3.0/handlebars",
            "json": "gallery/json2/json2",

            // plugin
            "easing": "plugin/jquery.easing.1.3",

            "kissy": "http://g.tbcdn.cn/kissy/k/1.4.0/seed-min.js"
        },

        paths: paths

    });

    // require to get the jquery exports
    S.define.amd.jQuery = true;

    /*
     * shim config
     */
    if (global.JSON) {
        register("json");
    }
    if (global.jQuery) {
        register("jquery", jQuery);
        register("$", jQuery);
    }
    if (global.KISSY) {
        register("kissy");
    }
})(tbtx);

;(function(S) {

    var isNotEmptyString = S.isNotEmptyString;

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
            return this;
        },

        remove: function(name, domain, path, secure) {
            // 置空，并立刻过期
            this.set(name, '', domain, -1, path, secure);
            return this;
        }
    };

    S.cookie = cookie;
})(tbtx);


;define("request", ["jquery"], function($) {
    var S = tbtx,
        cookie = S.cookie;

    var generateToken = function() {
        var token = Math.random().toString().substr(2) + (new Date()).getTime().toString().substr(1) + Math.random().toString().substr(2);
        cookie.set(S.tokenName, token, '', '', '/');
        return token;
    };
    // 默认蜜儿
    S.tokenName = "MIIEE_JTOKEN";

    var requestFailCode = -1,
        requestFailResponse = {
            code: requestFailCode,
            msg: "请求失败！请检查网络连接！"
        },
        requestingCode = -2,
        requestMap = {},
        /**
         * 适用于用到jtoken的请求
         */
        Request = function(url, data, successCode) {
            var config;

            if (S.isPlainObject(url)) {
                config = url;
                successCode = data;
            } else {
                data = data || {};
                if (S.isPlainObject(data) && !data.jtoken) {
                    data.jtoken = generateToken();
                }
                config = {
                    url: url,
                    data: data,
                    type: "post",
                    dataType: "json",
                    timeout: 10000
                };
            }

            successCode = successCode || 100;


            var deferred = requestMap[url];
            // 正在处理中
            if (deferred && deferred.state() === "pending") {
                deferred.notify(requestingCode);
                return deferred.promise();
            }

            deferred = requestMap[url] = $.Deferred();
            $.ajax(config)
            .done(function(response) {
                var code = response && response.code;
                if (code === successCode) {
                    deferred.resolve(response);
                } else {
                    deferred.reject(code, response);
                }
            })
            .fail(function() {
                deferred.reject(requestFailCode, requestFailResponse);
            });

            return deferred.promise();
        };

    S.Request = Request;
    return Request;
});

;define("msg", ["jquery", "position", "base/2.0/css/msg.css"], function($, Position) {
    var S = tbtx;

    var element = $('<div class="tbtx-broadcast"></div>').appendTo('body');

    var timer;
    // direction - top/bottom
    var broadcast = function(msg, duration, direction) {
        direction = direction || "center";
        duration = duration || 4000;

        if (timer) {
            timer.cancel();
        }

        if (!msg) {
            element.hide();
            return;
        }

        element.html(msg);

        if (direction == "center") {
            Position.center(element);
        } else {
            Position.pin({
                element: element,
                x: "50%",
                y: direction == "top" ? -60 : "100%+60"
            }, {
                element: Position.VIEWPORT,
                x: "50%",
                y: direction == "top" ? 0 : "100%"
            });
        }

        element.fadeIn();

        if (duration > 0) {
            timer = S.later(function() {
                element.fadeOut();
            }, duration, false);
        }
    };

    S.broadcast = broadcast;
});