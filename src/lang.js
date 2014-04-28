(function(global, S, undefined) {
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

        result: function(val) {
            if (val == null) {
                return void 0;
            }
            return S.isFunction(val) ? val.call(this, slice.call(arguments, 1)) : val;
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

        ucfirst: function(str) {
            return str.charAt(0).toUpperCase() + str.substring(1);
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
