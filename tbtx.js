/*
 * tbtx-base-js
 * update: 2014-08-01 5:21:24
 * shiyi_tbtx
 * tb_dongshuang.xiao@taobao.com
 */
(function(global, S, undefined) {

    var isSupportConsole = global.console && console.log,
        noop = function() {};

    S = global[S] = {

        version: "2.0",

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

            if (S.config("debug")) {
                console[cat && console[cat] ? cat : "log"](msg);
            }

            return this;
        } : noop,

        /**
         * Throws error message.
         */
        error: function (msg) {
            if (S.config("debug")) {
                throw msg instanceof Error ? msg : new Error(msg);
            }
        },

        /**
         * global对象，在浏览器环境中为window
         * @type {Object}
         */
        global: global,

        /**
         * 空函数，在需要使用空函数作为参数时使用
         */
        noop: noop,

        Config: {
            debug: location.search.indexOf("debug") !== -1 ? true : false,
            fns: {}
        },

        config: function(key, value) {
            var self = S,
                Config = self.Config,
                fns = Config.fns,
                fn,
                ret = self;

            if (typeof key === "string") {
                fn = fns[key];
                // get config
                if (value === undefined) {
                    ret = fn ? fn.call(self) : Config[key];
                } else { // set config
                    if (fn) {
                        ret = fn.call(self, value);
                    } else {
                        Config[key] = value;
                    }
                }
            } else {
                // Object Config
                S.each(key, function(v, k) {
                    fn = fns[k];
                    if (fn) {
                        fn.call(self, v);
                    } else {
                        Config[k] = v;
                    }
                });
            }
            return ret;
        }

    };

})(this, "tbtx");


;/**
 * 语言扩展
 */
(function(S, undefined) {

    /*
     * shim first
     */
    var global = S.global,

        AP = Array.prototype,
        SP = String.prototype,
        FP = Function.prototype,

        class2type = {},
        toString = class2type.toString,
        hasOwn = class2type.hasOwnProperty,
        slice = AP.slice,

        hasOwnProperty = function(o, p) {
            return hasOwn.call(o, p);
        },

        //切割字符串为一个个小块，以空格或逗号分开它们，结合replace实现字符串的forEach
        rword = /[^, ]+/g,
        // 是否是复杂类型， function暂不考虑
        rcomplexType = /^(?:object|array)$/,
        rsubstitute = /\\?\{\{\s*([^{}\s]+)\s*\}\}/g,
        // html标签
        rtags = /<[^>]+>/g,
        // script标签
        rscripts = /<script[^>]*>([\S\s]*?)<\/script>/img,

        cidCounter = 0,

        // return false终止循环
        // 原生every必须return true or false
        each = function(object, fn, context) {
            if (object == null) {
                return;
            }

            var i = 0,
                key,
                keys,
                length = object.length;

            context = context || null;

            if (length === +length) {
                for (; i < length; i++) {
                    if (fn.call(context, object[i], i, object) === false) {
                        break;
                    }
                }
            } else {
                keys = S.keys(object);
                length = keys.length;
                for (; i < length; i++) {
                    key = keys[i];
                    // can not use hasOwnProperty
                    if (fn.call(context, object[key], key, object) === false) {
                        break;
                    }
                }
            }
        };

    /**
     * Object.keys
     */
    if (!Object.keys) {
        var enumerables = "propertyIsEnumerable,isPrototypeOf,hasOwnProperty,toLocaleString,toString,valueOf,constructor".split(",");

        for (var i in {
            toString: 1
        }) {
            enumerables = false;
        }

        Object.keys = function(o) {
            var ret = [],
                p,
                i;

            for (p in o) {
                if (hasOwnProperty(o, p)) {
                    ret.push(p);
                }
            }
            if (enumerables) {
                for (i = enumerables.length - 1; i >= 0; i--) {
                    p = enumerables[i];
                    if (hasOwnProperty(o, p)) {
                        ret.push(p);
                    }
                }
            }

            return ret;
        };
    }

    if (!FP.bind) {
        FP.bind = function(context) {
            var args = slice.call(arguments, 1),
                fn = this,
                noop = function() {},
                ret = function() {
                    // 已经bind过context, context还应该是this
                    return fn.apply(this instanceof noop && context ? this : context || global, args.concat(slice.call(arguments)));
                };

            noop.prototype = this.prototype;
            ret.prototype = new noop();
            return ret;
        };
    }

    /**
     * Date.now
     */
    if (!Date.now) {
        Date.now = function() {
            return +new Date();
        };
    }

    if (!SP.trim) {
        var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
        SP.trim = function() {
            return this.replace(rtrim, "");
        };
    }

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
    if (!AP.forEach) {
        AP.forEach = function(fn, context) {
            var i = 0,
                length = this.length;

            for (; i < length; i++) {
                fn.call(context, this[i], i, this);
            }
        };
    }

    if (!AP.map) {
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

    if (!AP.filter) {
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

    if (!AP.some) {
        AP.some = function(fn, context) {
            var i = 0,
                length = this.length;

            for (; i < length; i++) {
                if (fn.call(context, this[i], i, this)) {
                    return true;
                }
            }
            return false;
        };
    }

    if (!AP.every) {
        AP.every = function(fn, context) {
            var i = 0,
                length = this.length;

            for (; i < length; i++) {
                if (!fn.call(context, this[i], i, this)) {
                    return false;
                }
            }
            return true;
        };
    }

    if (!AP.indexOf) {
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

    if (!AP.lastIndexOf) {
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

    if (!AP.reduce) {
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

    if (!AP.reduceRight) {
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

    S.keys = Object.keys;

    "map filter forEach some every reduce reduceRight indexOf lastIndexOf".replace(rword, function(name) {

        S[name] = function(object, fn, context) {
            if (object == null) {
                return;
            }
            // 处理arrayLike object
            if (object.length === +object.length) {
                object = makeArray(object);
            }

            var args = slice.call(arguments, 1),
                method = object[name];

            if (method === AP[name]) {
                return method.apply(object, args);
            } else {
                var keys = S.keys(object),
                    ret = {};

                // object只支持map filter即可满足大部分场景
                switch (name) {
                    case "filter":
                        each(keys, function(k) {
                            var v = object[k],
                                item = fn.call(context, v, k, object);

                            if (item) {
                                ret[k] = v;
                            }
                        });
                        break;
                    case "map":
                        each(keys, function(k, v) {
                            v = object[k];
                            ret[k] = fn.call(context, v, k, object);
                        });
                        break;
                    default:
                        return keys[name](function(k, v) {
                            v = object[k];
                            return fn.call(context, v, k, object);
                        });
                }
                return ret;
            }
        };
    });

    "Boolean Number String Function Array Date RegExp Object".replace(rword, function(name, lc) {
        class2type["[object " + name + "]"] = (lc = name.toLowerCase());
        S["is" + name] = function(o) {
            return type(o) === lc;
        };
    });

    var isArray = Array.isArray = S.isArray = Array.isArray || S.isArray,
        isFunction = S.isFunction,
        isObject = S.isObject,
        isString = S.isString,

        memoize = function(fn, hasher) {
            var memo = {};

            // 默认拿第一个传入的参数做key
            hasher = hasher || function(val) {
                return val + "";
            };

            return function() {
                var args = arguments,
                    key = hasher.apply(this, args),
                    val = memo[key];
                return val ? val : (memo[key] = fn.apply(this, args));
            };
        },

        /**
         * 单例模式
         * return only one instance
         * @param  {Function} fn      the function to return the instance
         * @param  {object}   context
         * @return {Function}
         */
        singleton = function(fn, context) {
            return memoize(fn.bind(context), function() {
                return 1;
            });
        },

        /**
         * jQuery type()
         */
        type = function(object) {
            if (object == null ) {
                return object + "";
            }
            return typeof object === "object" || typeof object === "function" ?
                class2type[toString.call(object)] || "object" :
                typeof object;
        },

        isComplexType = function(val) {
            return rcomplexType.test(type(val));
        },

        isWindow = function(object) {
            return object != null && object == object.window;
        },

        isPlainObject = function(object) {
            // Must be an Object.
            // Because of IE, we also have to check the presence of the constructor property.
            // Make sure that Dom nodes and window objects don't pass through, as well
            if (!isObject(object) || object.nodeType || isWindow(object)) {
                return false;
            }

            var key, constructor;

            try {
                // Not own constructor property must be Object
                if ((constructor = object.constructor) && !hasOwnProperty(object, "constructor") && !hasOwnProperty(constructor.prototype, "isPrototypeOf")) {
                    return false;
                }
            } catch (e) {
                // IE8,9 Will throw exceptions on certain host objects
                return false;
            }

            // Own properties are enumerated firstly, so to speed up,
            // if last one is own, then all properties are own.
            for (key in object) {}

            return key === undefined || hasOwnProperty(object, key);
        },

        makeArray = function(o) {
            if (o == null) {
                return [];
            }
            if (isArray(o)) {
                return o;
            }

            var ret = [],
                i = 0,
                length = o.length,
                lengthType = type(length),
                oType = type(o);

            if (lengthType !== "number" || typeof o.nodeName === "string" || isWindow(o) || oType === "string" || oType === "function" && !("item" in o && lengthType === "number")) {
                return [o];
            }
            for (; i < length; i++) {
                ret[i] = o[i];
            }
            return ret;
        },

        extend = function() {
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
                if ((options = arguments[i]) != null) {
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
                            target[name] = extend(deep, clone, copy);

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
            var str = "";
            each(htmlEntities, function(entity) {
                str += entity + "|";
            });
            str = str.slice(0, -1);
            return new RegExp(str, "g");
        }),
        getUnEscapeReg = singleton(function() {
            var str = "";
            each(reverseEntities, function(entity) {
                str += entity + "|";
            });
            str += "&#(\\d{1,5});";

            return new RegExp(str, "g");
        }),
        escapeHtml = function(text) {
            return (text + "").replace(getEscapeReg(), function(all) {
                return reverseEntities[all];
            });
        },
        unEscapeHtml = function(text) {
            return (text + "").replace(getUnEscapeReg(), function(all) {
                return htmlEntities[all];
            });
        };

    each(htmlEntities, function(entity, k) {
        reverseEntities[entity] = k;
    });

    // Now兼容之前的用法
    S.Now = S.now = Date.now;

    // S
    extend(S, {
        bind: function(fn, context) {
            return fn.bind(context);
        },

        trim: function(str) {
            return str.trim();
        },

        each: each,

        mix: extend,

        extend: extend,

        rword: rword,

        isWindow: isWindow,

        isPlainObject: isPlainObject,

        isComplexType: isComplexType,

        type: type,

        makeArray: makeArray,

        memoize: memoize,
        singleton: singleton,

        uniqueCid: function(prefix) {
            prefix = prefix || 0;
            return prefix + cidCounter++;
        },

        nextTick: global.setImmediate ? setImmediate.bind(global) : function(callback) {
            setTimeout(callback, 0);
        },

        isNotEmptyString: function(val) {
            return isString(val) && val !== "";
        },

        inArray: function(array, item) {
            if (isArray(item)) {
                array = [item, item = array][0];
            }
            return array.indexOf(item) > -1;
        },

        erase: function(array, item) {
            if (isArray(item)) {
                array = [item, item = array][0];
            }

            var index = array.indexOf(item);
            if (index > -1) {
                array.splice(index, 1);
            }
            return array;
        },

        unique: function(array) {
            var hash = {};

            return array.filter(function(item) {
                var key = type(item) + item;
                if (hash[key] !== 1) {
                    hash[key] = 1;
                    return true;
                }
                return false;
            });
        },

        namespace: function(space) {
            var i,
                p,
                o = this,
                length;

            p = ("" + space).split(".");

            for (i = global[p[0]] === o ? 1 : 0, length = p.length; i < length; i++) {
                o = o[p[i]] = o[p[i]] || {};
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
            return index >= 0 && str.indexOf(suffix, index) === index;
        },

        random: function(min, max) {
            var array, seed;

            if (isArray(min)) {
                array = min;
                min = 0;
                max = array.length - 1;
            }
            if (max == null) {
                max = min;
                min = 0;
            }
            seed = min + Math.floor(Math.random() * (max - min + 1));
            return array ? array[seed] : seed;
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
        later: function(fn, when, periodic, context, data) {
            when = when || 0;
            var m = fn,
                d = makeArray(data),
                f,
                r;

            if (isString(fn)) {
                m = context[fn];
            }

            if (!m) {
                S.error("later: method undefined");
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

        /**
         * 在underscore里面有实现，这个版本借鉴的是kissy
         */
        throttle: function(fn, ms, context) {
            context = context || this;
            ms = ms || 150;

            if (ms === -1) {
                return fn.bind(context);
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

            if (ms === -1) {
                return fn.bind(context);
            }
            var timer = null,
                f = function() {
                    f.stop();
                    timer = S.later(fn, ms, 0, context, arguments);
                };

            f.stop = function() {
                if (timer) {
                    timer.cancel();
                    timer = 0;
                }
            };
            return f;
        },

        /**
         * {{ name }} -> {{ o[name] }}
         * \{{}} -> \{{}}
         * blank 是否处理空
         * 默认没有替换为空
         */
        substitute: function(str, o, blank) {
            if (!isString(str) || !isComplexType(o)) {
                return str;
            }
            return str.replace(rsubstitute, function(match, name) {
                if (match.charAt(0) === '\\') {
                    return match.slice(1);
                }
                return (o[name] === undefined) ? blank ? match : "" : o[name];
            });
        },

        // 去除字符串中的html标签
        stripTags: function(str) {
            return (str + "").replace(rtags, "");
        },

        stripScripts: function(str, blacklist) {
            var scripts, pattern;

            if (blacklist) {

                blacklist = makeArray(blacklist);
                scripts = "(" + blacklist.join("|") + ")";

                pattern = new RegExp([
                    "<",
                    scripts,
                    "[^>]*([\\S\\s]*?)<\\/",
                    scripts,
                    ">"
                ].join(""), "img");

            }

            return (str + "").replace(pattern || rscripts, "");
        },

        /**
         * 对字符串进行截断处理
         */
        truncate: function(str, length, truncation) {
            str = str + "";
            truncation = truncation || "...";

            return str.length > length ? str.slice(0, length - truncation.length) + truncation : str;
        },

        escapeHtml: escapeHtml,
        unEscapeHtml: unEscapeHtml
    });

})(tbtx);

;/**
 * Uri 相关
 */
(function(S, undefined) {

    var each = S.each,
        isString = S.isString,
        makeArray = S.makeArray,
        memoize = S.memoize,
        error = S.error,
        rword = S.rword,

        encode = function(s) {
            return encodeURIComponent(s + "");
        },

        decode = function(s) {
            return decodeURIComponent(s.replace(/\+/g, " "));
        },

        param = function(o, sep, eq) {
            sep = sep || "&";
            eq = eq || "=";

            var buf = [];
            each(o, function(val, key) {
                key = encode(key);
                if (isValidParamValue(val)) {
                    buf.push(key);
                    if (val !== undefined) {
                        buf.push(eq, encode(val + ""));
                    }
                    buf.push(sep);
                }
            });

            buf.pop();
            return buf.join("");
        },

        /**
         * query字符串转为对象
         */
        unparam = memoize(function(str, sep, eq) {
            str = (str + "").trim();

            if (!str) {
                return {};
            }
            sep = sep || "&";
            eq = eq || "=";

            var ret = {},
                eqIndex,
                pairs = str.split(sep),
                key,
                val,
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
                        error(e + "decodeURIComponent error : " + val, "error", "unparam");
                    }
                }
                ret[key] = val;
            }
            return ret;
        }, function(str, sep, eq) {
            return "" + str + sep + eq;
        }),

        Query = S.Query = function(query) {
            this._query = query;
            this._map = unparam(this._query);
        },

        fn = Query.prototype = {

            /**
             * Return parameter value corresponding to current key
             * @param {String} [key]
             */
            get: function(key) {
                var _map = this._map;
                return key ? _map[key] : _map;
            },

            /**
             * Set parameter value corresponding to current key
             * @param {String} key
             * @param value
             * @chainable
             */
            set: function(key, value) {
                var query = this,
                    _map = query._map;

                if (isString(key)) {
                    _map[key] = value;
                } else {
                    if (key instanceof Query) {
                        key = key.get();
                    }
                    each(key, function(v, k) {
                        _map[k] = v;
                    });
                }
                return query;
            },

            /**
             * Remove parameter with specified name.
             * @param {String} key
             * @chainable
             */
            remove: function(key) {
                var query = this;

                if (key) {
                    key = makeArray(key);
                    key.forEach(function(k) {
                        delete query._map[k];
                    });
                } else {
                    query._map = {};
                }
                return query;
            },

            /**
             * Serialize query to string.
             */
            toString: function() {
                return param(this._map);
            }
        },

        ruri = new RegExp([
            "^",
            "(?:",
                "([^:/?#]+)", // scheme
            ":)?",
            "(?://",
                "(?:([^/?#]*)@)?", // credentials
                "([^/?#:@]*)", // domain
                "(?::([0-9]+))?", // port
            ")?",
            "([^?#]+)?", // path
            "(?:\\?([^#]*))?", // query
            "(?:#(.*))?", // fragment
            "$",
        ].join("")),

        rinfo = {
            scheme: 1,
            credentials: 2,
            domain: 3,
            port: 4,
            path: 5,
            query: 6,
            fragment: 7
        },

        defaultUri = location.href;

        Uri = S.Uri = function(uriStr) {
            var uri = this,
                components = Uri.getComponents(uriStr);

            each(components, function(v, key) {

                if (key === "query") {
                    // need encoded content
                    uri.query = new Query(v);
                } else {
                    // https://github.com/kissyteam/kissy/issues/298
                    try {
                        v = decode(v);
                    } catch (e) {
                        error(e + "urlDecode error : " + v, "error", "Uri");
                    }
                    // need to decode to get data structure in memory
                    uri[key] = v;
                }
            });

            return uri;
        };

    fn.add = fn.set;

    Uri.prototype = {

        getFragment: function() {
            return this.fragment;
        },

        toString: function() {
            var ret = [],
                uri = this,
                scheme = uri.scheme,
                domain = uri.domain,
                path = uri.path,
                port = uri.port,
                fragment = uri.fragment,
                query = uri.query.toString(),
                credentials = uri.credentials;

            if (scheme) {
                ret.push(scheme);
                ret.push(":");
            }

            if (domain) {
                ret.push("//");
                if (credentials) {
                    ret.push(credentials);
                    ret.push("@");
                }

                ret.push(encode(domain));

                if (port) {
                    ret.push(":");
                    ret.push(port);
                }
            }

            if (path) {
                ret.push(path);
            }

            if (query) {
                ret.push("?");
                ret.push(query);
            }

            if (fragment) {
                ret.push("#");
                ret.push(fragment);
            }

            return ret.join("");
        }
    };

    Uri.getComponents = memoize(function(uri) {
        uri = uri || defaultUri;

        var m = uri.match(ruri) || [],
            ret = {};

        each(rinfo, function(index, key) {
            ret[key] = m[index] || "";
        });

        return ret;
    }, function(uri) {
        return uri || defaultUri;
    });


    function isValidParamValue(val) {
        var t = typeof val;
        // If the type of val is null, undefined, number, string, boolean, return TRUE.
        return val === null || (t !== "object" && t !== "function");
    }

    var isUri = memoize(function(val) {
        val = val + "";

        // 相对链接
        if (val.charAt(0) === "/") {
            return true;
        }

        var match = ruri.exec(val);
        // scheme
        // file:/// -> no domain
        return match && !!match[1];
    });

    /**
     * get/set/remove/add QueryParam
     * uri, args... or args.., uri
     */
    "add get remove set".replace(rword, function(name) {
        S[name + "QueryParam"] = function() {
            var args = makeArray(arguments),
                length = args.length,
                // 第一个跟最后一个参数都可能是uri
                first = args[0],
                last = args[length - 1],
                uriStr;

            if (isUri(first)) {
                uriStr = first;
                args.shift();
            } else if (isUri(last)) {
                uriStr = last;
                args.pop();
            }

            var uri = new Uri(uriStr),
                query = uri.query,
                ret = query[name].apply(query, args);

            return ret === query ? uri.toString() : ret || "";
        };
    });

    S.mix({
        urlEncode: encode,
        urlDecode: decode,
        param: param,
        unparam: unparam,

        isUri: isUri,

        parseUri: function(uri) {
            return Uri.getComponents(uri);
        },

        getFragment: function(uri) {
            return new Uri(uri).getFragment();
        }
    });

    // 兼容之前的API
    S.parseUrl = S.parseUri;

})(tbtx);

;(function(S, document) {
    // thanks modernizr

    var ucfirst = S.ucfirst,
        ua = navigator.userAgent,

        support = S.support = {},

        documentElement = document.documentElement,
        element = document.createElement("tbtx"),

        style = element.style,

        spliter = " ",

        omPrefixes = "Webkit Moz O ms",

        cssomPrefixes = omPrefixes.split(spliter);

    var prefixed = function(prop) {
            return testPropsAll(prop, "pfx");
        },
        testProps = function(props, prefixed) {
            var prop,
                i;

            for (i in props) {
                prop = props[i];
                if (style[prop] !== undefined) {
                    return prefixed == "pfx" ? prop : true;
                }
            }
            return false;
        },
        testPropsAll = function (prop, prefixed) {
            var ucProp = ucfirst(prop),
                props = (prop + spliter + cssomPrefixes.join(ucProp + spliter) + ucProp).split(spliter);

            return testProps(props, prefixed);
        };

    support.add = function(name, fn) {
        support[name] = fn.call(support);
        return this;
    };

    "transition transform".replace(S.rword, function(name) {
        support[name] = testPropsAll(name);
    });

    support.add("canvas", function() {
        var elem = document.createElement("canvas");
        return !!(elem.getContext && elem.getContext("2d"));
    }).add("mobile", function() {
        // 是否是移动设备，包含pad
        return !!ua.match(/AppleWebKit.*Mobile.*/) || "ontouchstart" in documentElement;
    }).add("pad", function() {
        return !!ua.match(/iPad/i);
    }).add("phone", function() {
        return this.mobile && !this.pad;
    }).add("placeholder", function() {
        return "placeholder" in document.createElement("input");
    });

    S.mix({
        testPropsAll: testPropsAll,
        prefixed: prefixed
    });
})(tbtx, document);


;/**
 * an amd loader
 * thanks seajs
 * 尽量减少对seajs代码的修改
 */
(function(S, undefined) {

    var isObject = S.isObject,
        isString = S.isString,
        isArray = S.isArray,
        isFunction = S.isFunction,
        global = S.global,
        noop = S.noop,
        Loader = S.Loader = {},
        data = Loader.data = {};

    var _cid = 0;
    function cid() {
        return _cid++;
    }

    // path
    var DIRNAME_RE = /[^?#]*\//,
        DOT_RE = /\/\.\//g,
        DOUBLE_DOT_RE = /\/[^/]+\/\.\.\//,
        MULTI_SLASH_RE = /([^:/])\/\//g;

    // Extract the directory portion of a path
    // dirname("a/b/c.js?t=123#xx/zz") ==> "a/b/"
    // ref: http://jsperf.com/regex-vs-split/2
    function dirname(path) {
        return path.match(DIRNAME_RE)[0];
    }

    // Canonicalize a path
    // realpath("http://test.com/a//./b/../c") ==> "http://test.com/a/c"
    function realpath(path) {
        // /a/b/./c/./d ==> /a/b/c/d
        path = path.replace(DOT_RE, "/");

        // a//b/c  ==>  a/b/c
        path = path.replace(MULTI_SLASH_RE, "$1/");

        // a/b/c/../../d  ==>  a/b/../d  ==>  a/d
        while (path.match(DOUBLE_DOT_RE)) {
            path = path.replace(DOUBLE_DOT_RE, "/");
        }

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


    var PATHS_RE = /^([^/:]+)(\/.+)$/,
        VARS_RE = /{([^{]+)}/g;

    function parseAlias(id) {
        var alias = data.alias;
        return alias && isString(alias[id]) ? alias[id] : id;
    }

    function parsePaths(id) {
        var paths = data.paths,
            m;

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
        var map = data.map,
            ret = uri;

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


    var ABSOLUTE_RE = /^\/\/.|:\//,
        ROOT_DIR_RE = /^.*?\/\/.*?\//;

    function addBase(id, refUri) {
        var ret,
            first = id.charAt(0);

        // Absolute
        if (ABSOLUTE_RE.test(id)) {
            ret = id;
        }
        // Relative
        else if (first === ".") {
            ret = (refUri ? dirname(refUri) : data.cwd) + id;
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

        return realpath(ret);
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

    var doc = document,
        cwd = dirname(location.href),
        scripts = doc.scripts,
        loaderScript = scripts[scripts.length - 1],
        loaderDir = dirname(getScriptAbsoluteSrc(loaderScript) || cwd);

    function getScriptAbsoluteSrc(node) {
        return node.hasAttribute ? // non-IE6/7
            node.src :
            // see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
            node.getAttribute("src", 4);
    }


    /**
     * util-request.js - The utilities for requesting script and style files
     * ref: tests/research/load-js-css/test.html
     */

    var head = doc.head || doc.getElementsByTagName("head")[0] || doc.documentElement,
        baseElement = head.getElementsByTagName("base")[0];

    // 当前正在加载的script
    var currentlyAddingScript,
        interactiveScript,
        IS_CSS_RE = /\.css(?:\?|$)/i,
        isOldWebKit = +navigator.userAgent
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
        var sheet = node.sheet,
            isLoaded;

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

        var scripts = head.getElementsByTagName("script"),
            script,
            i = scripts.length - 1;

        for (; i >= 0; i--) {
            script = scripts[i];
            if (script.readyState === "interactive") {
                interactiveScript = script;
                return interactiveScript;
            }
        }
    }

    /**
     * module.js - The core of module loader
     */

    var cachedMods = Loader.cache = {},
        anonymousMeta,
        fetchingList = {},
        fetchedList = {},
        callbackList = {};

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
            var mod = this,
                uri = mod.uri,
                ids = mod.dependencies;

            return S.map(ids, function(id) {
                return Module.resolve(id, uri);
            });
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
            var len = mod._remain = uris.length,
                m,
                i = 0;

            // Initialize modules and register waitings
            for (; i < len; i++) {
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
            var waitings = mod._waitings,
                uri,
                m;

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

            var uri = mod.uri,
                uris = mod.resolve(),
                deps = [],
                i = 0,
                len = uris.length;

            for (; i < len; i++) {
                deps[i] = Module.get(uris[i]).exports;
            }

            // Exec factory
            var factory = mod.factory,
                exports = isFunction(factory) ?
                    factory.apply(null, deps) :
                    factory;

            if (exports === undefined) {
                exports = mod.exports;
            }

            // if (exports === null) {

            // }

            // Reduce memory leak
            delete mod.factory;

            mod.exports = exports;
            mod.status = STATUS.EXECUTED;

            // Emit `exec` event
            // emit("exec", mod)

            return exports;
        },

        fetch: function() {
            var mod = this,
                uri = mod.uri;

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
            var exports = [],
                uris = mod.resolve(),
                i = 0,
                len = uris.length;

            for (; i < len; i++) {
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
            var curr = configData[key],
                prev = data[key];

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


    Loader.resolve = id2Uri;

    global.define = S.define = Module.define;

    S.require = function(ids, callback) {
        Module.require(ids, callback, data.cwd + "_require_" + cid());
        return S;
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

    var RE_NON_WORD = /\W/g,
        styleNode;

    S.importStyle = function(cssText, id) {
        if (id) {
            // Convert id to valid string
            id = id.replace(RE_NON_WORD, '-');

            // Don't add multiple times
            if (doc.getElementById(id)) return;
        }

        var element;

        // Don't share styleNode when id is spectied
        if (!styleNode || id) {
            element = doc.createElement("style");
            if (id) {
                element.id = id;
            }

            // Adds to DOM first to avoid the css hack invalid
            head.appendChild(element);
        } else {
            element = styleNode;
        }

        // IE
        if (element.styleSheet !== undefined) {

            // http://support.microsoft.com/kb/262161
            if (doc.getElementsByTagName("style").length > 31) {
                S.error("Exceed the maximal count of style tags in IE");
            }

            element.styleSheet.cssText += cssText;
        }
        // W3C
        else {
            element.appendChild(doc.createTextNode(cssText));
        }

        if (!id) {
            styleNode = element;
        }
    };


    S.mix({
        register: Module.register,
        realpath: realpath
    });
})(tbtx);


;(function(S) {
    var realpath = S.realpath,
        fns = S.Config.fns,
        Loader = S.Loader,
        data = Loader.data,
        config = Loader.config,
        loaderDir = data.dir,
        staticUrl = S.staticUrl = realpath(loaderDir + "../../../");

    /**
     * paths config
     */
    var paths = {},
        alias = {
            // arale
            "events": "arale/events/1.1.0/events",
            "class": "arale/class/1.1.0/class",
            "base": "arale/base/1.1.1/base",
            "widget": "arale/widget/1.1.1/widget",
            "position": "arale/position/1.0.1/position",
            "detector": "arale/detector/1.3.0/detector",

            // dist
            "router": "dist/router",

            // component
            "overlay": "component/overlay/1.1.4/overlay",
            "popup": "component/popup/1.0.0/popup",
            "switchable": "component/switchable/1.0.3/switchable",
            "validator": "component/validator/0.9.7/validator",

            // gallery
            "jquery": S.support.phone ? "gallery/jquery/2.1.1/jquery.min" : "gallery/jquery/1.8.3/jquery.min",
            "zepto": "gallery/zepto/1.1.2/zepto.min",
            "handlebars": "gallery/handlebars/1.3.0/handlebars",
            "json": "gallery/json2/json2",

            // 2.1.5不支持IE8
            "clipboard": "gallery/zeroclipboard/1.3.5/ZeroClipboard.min",

            // plugin
            "easing": "plugin/jquery.easing.1.3",

            "kissy": "http://g.tbcdn.cn/kissy/k/1.4.0/seed-min.js"
        };

    ["dist", "plugin", "gallery", "component"].forEach(function(name) {
        paths[name] = loaderDir + name;
    });

    paths.arale = loaderDir + "dist/arale";

    alias.$ = alias.jquery;

    config({
        base: staticUrl,

        alias: alias,

        paths: paths

    });

    if (!S.config("debug")) {
        config({
            // 每小时更新时间戳
            map: [
                [/^(.*\.(?:css|js))(.*)$/i, "$1?t=" + Math.floor(Date.now() / 3600000)]
            ]
        });
    }

    "alias map paths".replace(S.rword, function(name) {
        fns[name] = function(val) {
            if (val) {
                var cfg = {};
                cfg[name] = val;
                config(cfg);
            } else {
                return data[name];
            }
        };
    });
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


;define("arale/events/1.1.0/events", [], function() {
    // Events
    // -----------------
    // Thanks to:
    //  - https://github.com/documentcloud/backbone/blob/master/backbone.js
    //  - https://github.com/joyent/node/blob/master/lib/events.js
    // Regular expression used to split event strings
    var eventSplitter = /\s+/;
    // A module that can be mixed in to *any object* in order to provide it
    // with custom events. You may bind with `on` or remove with `off` callback
    // functions to an event; `trigger`-ing an event fires all callbacks in
    // succession.
    //
    //     var object = new Events();
    //     object.on('expand', function(){ alert('expanded'); });
    //     object.trigger('expand');
    //
    function Events() {}
    // Bind one or more space separated events, `events`, to a `callback`
    // function. Passing `"all"` will bind the callback to all events fired.
    Events.prototype.on = function(events, callback, context) {
        var cache, event, list;
        if (!callback) return this;
        cache = this.__events || (this.__events = {});
        events = events.split(eventSplitter);
        while (event = events.shift()) {
            list = cache[event] || (cache[event] = []);
            list.push(callback, context);
        }
        return this;
    };
    // Remove one or many callbacks. If `context` is null, removes all callbacks
    // with that function. If `callback` is null, removes all callbacks for the
    // event. If `events` is null, removes all bound callbacks for all events.
    Events.prototype.off = function(events, callback, context) {
        var cache, event, list, i;
        // No events, or removing *all* events.
        if (!(cache = this.__events)) return this;
        if (!(events || callback || context)) {
            delete this.__events;
            return this;
        }
        events = events ? events.split(eventSplitter) : keys(cache);
        // Loop through the callback list, splicing where appropriate.
        while (event = events.shift()) {
            list = cache[event];
            if (!list) continue;
            if (!(callback || context)) {
                delete cache[event];
                continue;
            }
            for (i = list.length - 2; i >= 0; i -= 2) {
                if (!(callback && list[i] !== callback || context && list[i + 1] !== context)) {
                    list.splice(i, 2);
                }
            }
        }
        return this;
    };
    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    Events.prototype.trigger = function(events) {
        var cache, event, all, list, i, len, rest = [], args, returned = {
            status: true
        };
        if (!(cache = this.__events)) return this;
        events = events.split(eventSplitter);
        // Fill up `rest` with the callback arguments.  Since we're only copying
        // the tail of `arguments`, a loop is much faster than Array#slice.
        for (i = 1, len = arguments.length; i < len; i++) {
            rest[i - 1] = arguments[i];
        }
        // For each event, walk through the list of callbacks twice, first to
        // trigger the event, then to trigger any `"all"` callbacks.
        while (event = events.shift()) {
            // Copy callback lists to prevent modification.
            if (all = cache.all) all = all.slice();
            if (list = cache[event]) list = list.slice();
            // Execute event callbacks.
            callEach(list, rest, this, returned);
            // Execute "all" callbacks.
            callEach(all, [ event ].concat(rest), this, returned);
        }
        return returned.status;
    };
    // Mix `Events` to object instance or Class function.
    Events.mixTo = function(receiver) {
        receiver = receiver.prototype || receiver;
        var proto = Events.prototype;
        for (var p in proto) {
            if (proto.hasOwnProperty(p)) {
                receiver[p] = proto[p];
            }
        }
    };
    // Helpers
    // -------
    var keys = Object.keys;
    // Execute callbacks
    function callEach(list, args, context, returned) {
        var r;
        if (list) {
            for (var i = 0, len = list.length; i < len; i += 2) {
                r = list[i].apply(list[i + 1] || context, args);
                // trigger will return false if one of the callbacks return false
                r === false && returned.status && (returned.status = false);
            }
        }
    }

    return Events;
});

;define("arale/position/1.0.1/position", ["jquery"], function($) {

    var Position = {},
        VIEWPORT = {
            _id: 'VIEWPORT',
            nodeType: 1
        },
        isPinFixed = false,
        ua = (window.navigator.userAgent || "").toLowerCase(),
        isIE6 = ua.indexOf("msie 6") !== -1;


    // 将目标元素相对于基准元素进行定位
    // 这是 Position 的基础方法，接收两个参数，分别描述了目标元素和基准元素的定位点
    Position.pin = function(pinObject, baseObject) {

        // 将两个参数转换成标准定位对象 { element: a, x: 0, y: 0 }
        pinObject = normalize(pinObject);
        baseObject = normalize(baseObject);

        // 设定目标元素的 position 为绝对定位
        // 若元素的初始 position 不为 absolute，会影响元素的 display、宽高等属性
        var pinElement = $(pinObject.element);

        if (pinElement.css('position') !== 'fixed' || isIE6) {
            pinElement.css('position', 'absolute');
            isPinFixed = false;
        } else {
            // 定位 fixed 元素的标志位，下面有特殊处理
            isPinFixed = true;
        }

        // 将位置属性归一化为数值
        // 注：必须放在上面这句 `css('position', 'absolute')` 之后，
        //    否则获取的宽高有可能不对
        posConverter(pinObject);
        posConverter(baseObject);

        var parentOffset = getParentOffset(pinElement);
        var baseOffset = baseObject.offset();

        // 计算目标元素的位置
        var top = baseOffset.top + baseObject.y -
            pinObject.y - parentOffset.top;

        var left = baseOffset.left + baseObject.x -
            pinObject.x - parentOffset.left;

        // 定位目标元素
        pinElement.css({
            left: left,
            top: top
        });
    };


    // 将目标元素相对于基准元素进行居中定位
    // 接受两个参数，分别为目标元素和定位的基准元素，都是 DOM 节点类型
    Position.center = function(pinElement, baseElement) {
        Position.pin({
            element: pinElement,
            x: '50%',
            y: '50%'
        }, {
            element: baseElement,
            x: '50%',
            y: '50%'
        });
    };


    // 这是当前可视区域的伪 DOM 节点
    // 需要相对于当前可视区域定位时，可传入此对象作为 element 参数
    Position.VIEWPORT = VIEWPORT;


    // Helpers
    // -------

    // 将参数包装成标准的定位对象，形似 { element: a, x: 0, y: 0 }

    function normalize(posObject) {
        posObject = toElement(posObject) || {};

        if (posObject.nodeType) {
            posObject = {
                element: posObject
            };
        }

        var element = toElement(posObject.element) || VIEWPORT;
        if (element.nodeType !== 1) {
            throw new Error('posObject.element is invalid.');
        }

        var result = {
            element: element,
            x: posObject.x || 0,
            y: posObject.y || 0
        };

        // config 的深度克隆会替换掉 Position.VIEWPORT, 导致直接比较为 false
        var isVIEWPORT = (element === VIEWPORT || element._id === 'VIEWPORT');

        // 归一化 offset
        result.offset = function() {
            // 若定位 fixed 元素，则父元素的 offset 没有意义
            if (isPinFixed) {
                return {
                    left: 0,
                    top: 0
                };
            } else if (isVIEWPORT) {
                return {
                    left: $(document).scrollLeft(),
                    top: $(document).scrollTop()
                };
            } else {
                return getOffset($(element)[0]);
            }
        };

        // 归一化 size, 含 padding 和 border
        result.size = function() {
            var el = isVIEWPORT ? $(window) : $(element);
            return {
                width: el.outerWidth(),
                height: el.outerHeight()
            };
        };

        return result;
    }

    // 对 x, y 两个参数为 left|center|right|%|px 时的处理，全部处理为纯数字

    function posConverter(pinObject) {
        pinObject.x = xyConverter(pinObject.x, pinObject, 'width');
        pinObject.y = xyConverter(pinObject.y, pinObject, 'height');
    }

    // 处理 x, y 值，都转化为数字

    function xyConverter(x, pinObject, type) {
        // 先转成字符串再说！好处理
        x = x + '';

        // 处理 px
        x = x.replace(/px/gi, '');

        // 处理 alias
        if (/\D/.test(x)) {
            x = x.replace(/(?:top|left)/gi, '0%')
                .replace(/center/gi, '50%')
                .replace(/(?:bottom|right)/gi, '100%');
        }

        // 将百分比转为像素值
        if (x.indexOf('%') !== -1) {
            //支持小数
            x = x.replace(/(\d+(?:\.\d+)?)%/gi, function(m, d) {
                return pinObject.size()[type] * (d / 100.0);
            });
        }

        // 处理类似 100%+20px 的情况
        if (/[+\-*\/]/.test(x)) {
            try {
                // eval 会影响压缩
                // new Function 方法效率高于 for 循环拆字符串的方法
                // 参照：http://jsperf.com/eval-newfunction-for
                x = (new Function('return ' + x))();
            } catch (e) {
                throw new Error('Invalid position value: ' + x);
            }
        }

        // 转回为数字
        return numberize(x);
    }

    // 获取 offsetParent 的位置

    function getParentOffset(element) {
        var parent = element.offsetParent();

        // IE7 下，body 子节点的 offsetParent 为 html 元素，其 offset 为
        // { top: 2, left: 2 }，会导致定位差 2 像素，所以这里将 parent
        // 转为 document.body
        if (parent[0] === document.documentElement) {
            parent = $(document.body);
        }

        // 修正 ie6 下 absolute 定位不准的 bug
        if (isIE6) {
            parent.css('zoom', 1);
        }

        // 获取 offsetParent 的 offset
        var offset;

        // 当 offsetParent 为 body，
        // 而且 body 的 position 是 static 时
        // 元素并不按照 body 来定位，而是按 document 定位
        // http://jsfiddle.net/afc163/hN9Tc/2/
        // 因此这里的偏移值直接设为 0 0
        if (parent[0] === document.body &&
            parent.css('position') === 'static') {
            offset = {
                top: 0,
                left: 0
            };
        } else {
            offset = getOffset(parent[0]);
        }

        // 根据基准元素 offsetParent 的 border 宽度，来修正 offsetParent 的基准位置
        offset.top += numberize(parent.css('border-top-width'));
        offset.left += numberize(parent.css('border-left-width'));

        return offset;
    }

    function numberize(s) {
        return parseFloat(s, 10) || 0;
    }

    function toElement(element) {
        return $(element)[0];
    }

    // fix jQuery 1.7.2 offset
    // document.body 的 position 是 absolute 或 relative 时
    // jQuery.offset 方法无法正确获取 body 的偏移值
    //   -> http://jsfiddle.net/afc163/gMAcp/
    // jQuery 1.9.1 已经修正了这个问题
    //   -> http://jsfiddle.net/afc163/gMAcp/1/
    // 这里先实现一份
    // 参照 kissy 和 jquery 1.9.1
    //   -> https://github.com/kissyteam/kissy/blob/master/src/dom/sub-modules/base/src/base/offset.js#L366 
    //   -> https://github.com/jquery/jquery/blob/1.9.1/src/offset.js#L28

    function getOffset(element) {
        var box = element.getBoundingClientRect(),
            docElem = document.documentElement;

        // < ie8 不支持 win.pageXOffset, 则使用 docElem.scrollLeft
        return {
            left: box.left + (window.pageXOffset || docElem.scrollLeft) - (docElem.clientLeft || document.body.clientLeft || 0),
            top: box.top + (window.pageYOffset || docElem.scrollTop) - (docElem.clientTop || document.body.clientTop || 0)
        };
    }

    return Position;
});


;/**
 * formate格式只有2014/07/12 12:34:35的格式可以跨平台
 * new Date()
 * new Date(时间戳)
 * new Date(year, month, day[, hour[, minute[, second[, millisecond]]]])
 */
(function(S) {

    var isDate = S.isDate,
        each = S.each,
        floor = Math.floor,
        EMPTY = "",
        rword = S.rword,
        rformat = /y|m|d|h|i|s/gi,
        rdate = /number|object/,
        rnewdate = /number|string/;

    /*
     * 将日期格式化成字符串
     *  Y - 4位年
     *  y - 2位年
     *  M - 不补0的月,
     *  m - 补0的月
     *  D - 不补0的日期
     *  d - 补0的日期
     *  H - 不补0的小时
     *  h - 补0的小时
     *  I - 不补0的分
     *  i - 补0的分
     *  S - 不补0的秒
     *  s - 补0的秒
     *  毫秒暂不支持
     *  @return：指定格式的字符串
     */
    function formatDate(format, date) {
        // 交换参数
        if (rdate.test(typeof format)) {
            date = [format, format = date][0];
        }

        format = format || "Y-m-d h:i:s";
        date = normalizeDate(date);

        return format.replace(rformat, function(k) {
            return date[k];
        });
    }

    // date转对象
    function normalizeDate(date) {
        date = makeDate(date);

        var o = {
                Y: date.getFullYear(),
                M: date.getMonth() + 1,
                D: date.getDate(),
                H: date.getHours(),
                I: date.getMinutes(),
                S: date.getSeconds()
            },
            ret = {};

        each(o, function(v, k) {
            v = EMPTY + v;

            ret[k] = v;

            k = k.toLowerCase();
            ret[k] = k === "y" ? v.substring(2, 4) : padding2(v);
        });

        ret.origin = date;
        return ret;
    }

    var seconds = {
        second: 1,
        minute: 60,
        hour: 60 * 60,
        day: 60 * 60 * 24
    };
    function diffDate(d1, d2) {
        d1 = makeDate(d1);
        d2 = makeDate(d2);

        // 相差的秒
        var diff = Math.abs(d1 - d2) / 1000,
            remain = diff,
            ret = {};

        "day hour minute second".replace(rword, function(name) {
            var s = seconds[name],
                current = floor(remain / s);

            ret[name] = current;
            remain -= s * current;
        });
        return ret;
    }

    // 字符串/数字 -> Date
    function makeDate(date) {
        if (isDate(date)) {
            return new Date(+date);
        }

        return rnewdate.test(typeof date) ? new Date(date) : new Date();
    }

    function padding2(str) {
        str = EMPTY + str;
        return str.length === 1 ? "0" + str : str;
    }

    S.mix({
        normalizeDate: normalizeDate,
        diffDate: diffDate,
        makeDate: makeDate,
        formatDate: formatDate
    });
})(tbtx);


;define("request", ["jquery", "json"], function($) {
    var S = tbtx,
        cookie = S.cookie,
        isPlainObject = S.isPlainObject,
        config = S.config;

    var generateToken = S.generateToken = function() {
        var token = Math.random().toString().substr(2) + Date.now().toString().substr(1) + Math.random().toString().substr(2);
        cookie.set(config("tokenName"), token, '', '', '/');
        return token;
    };

    if (!config("tokenName")) {
        // 默认蜜儿
        config("tokenName", "MIIEE_JTOKEN");
    }

    config({
        requestFailCode: -1,
        requestFailMsg: "请求失败！请检查网络连接！",

        // 正在请求中，state === "pending"
        requestingCode: -2,
        requestSuccessCode: 100
    });

    var deferredMap = {},
        requestData = {},

        request = function(url, data, successCode, nocache) {
            var settings = {
                type: "post",
                dataType: "json",
                timeout: 10000
            };

            if (isPlainObject(url)) {
                settings = S.extend(settings, url);
                nocache = successCode;
                successCode = data;
            } else {
                data = data || {};
                settings.url = url;
                settings.data = data;
            }

            url = settings.url.trim();
            data = settings.data;
            if (typeof successCode === "boolean") {
                nocache = successCode;
                successCode = 0;
            }
            successCode = successCode || config("requestSuccessCode");


            var deferred = deferredMap[url];
            if (!nocache && deferred && deferred.state() === "pending") {
                if (isEqual(data, requestData[url])) {
                    deferred.notify(config("requestingCode"));
                    return deferred.promise();
                }
            }


            deferred = deferredMap[url] = $.Deferred();
            requestData[url] = data;

            if (isPlainObject(data) && !data.jtoken) {
                data.jtoken = generateToken();
            }
            // url 加上时间戳
            settings.url = S.addQueryParam(url, "_", String(Math.random()).replace(/\D/g, ""));

            $.ajax(settings)
            .done(function(response) {
                var code, result;
                if (response) {
                    code = response.code;
                    result = response.result;
                }

                if (code === successCode) {
                    // 有result返回result，没有result返回response
                    // 返回result时加一层result来兼容之前的写法
                    if (result) {
                        response = result;
                        response.result = S.extend(Array.isArray(response) ? [] : {}, response);
                    }
                    deferred.resolve(response);
                } else {
                    deferred.reject(code, response);
                }
            })
            .fail(function() {
                deferred.reject(config("requestFailCode"), {
                    code: config("requestFailCode"),
                    msg: config("requestFailMsg")
                });
            });

            return deferred.promise();
        };

    // 大写兼容之前的用法
    S.Request = S.request = request;


    function isEqual(a, b) {
        return JSON.stringify(a) == JSON.stringify(b);
    }

    return request;
});

;define("msg", ["widget", "position", "base/2.0/css/msg.css"], function(Widget, Position) {
    var S = tbtx;

    var BroadcastWidget = Widget.extend({
        attrs: {
            visible: false,
            msg: "",
            // 消息持续时间
            duration: 4000,
            // 消息位置
            direction: "center"
        },

        events: {
            "click": "clear"
        },

        _onRenderVisible: function(val) {
            this.element[val ? "fadeIn" : "fadeOut"]();
        },

        clear: function() {
            var self = this;
            self.set("msg", "");
        },

        _onRenderMsg: function(val) {
            var self = this,
                duration = this.get("duration");

            if (self.timer) {
                self.timer.cancel();
            }
            if (!val) {
                self.set("visible", false);
                return;
            }

            self.element.html(val);
            self.set("visible", true);
            self.pin();

            if (duration > 0) {
                self.timer = S.later(self.clear, duration, false, self);
            }
        },

        pin: function() {
            var instance = this,
                element = instance.element,
                direction = instance.get("direction");

            if (direction === "center") {
                Position.center(element);
            } else {
                Position.pin({
                    element: element,
                    x: "50%",
                    y: direction === "top" ? -60 : "100%+60"
                }, {
                    element: Position.VIEWPORT,
                    x: "50%",
                    y: direction === "top" ? 0 : "100%"
                });
            }
        }
    });

    var getInstance = S.singleton(function() {
        return new BroadcastWidget({
            className: "tbtx-broadcast"
        }).render();
    });

    var broadcast = function(msg, direction, duration) {
        var instance = getInstance();

        if (duration) {
            instance.set("duration", duration);
        }
        instance.set("msg", msg);
        instance.set("direction", direction || "center");
        return S;
    };

    S.broadcast = broadcast;
    return broadcast;
});

;(function(S){

    var global = S.global,
        register = S.register;

    // require to get the jquery exports
    S.define.amd.jQuery = true;

    /*
     * shim config
     */
    if (global.JSON) {
        register("json");
    }

    var $ = global.jQuery || global.Zepto;
    if ($) {
        register("jquery", $);
        register("$", $);
    }

    // events
    S.require("events", function(Events) {
        S.Events = Events;
        Events.mixTo(S);
    });

    var preloadConfig = {
        broadcast: {
            module: "msg"
        },
        pin: {
            module: "position"
        },
        center: {
            module: "position"
        }
    };

    // 某些没有return的模块接口可以提前写入
    S.each(preloadConfig, function(config, name) {
        var module = config.module || name;

        S[name] = function() {
            var args = arguments;

            S.require(module, function(exports) {
                var fn = exports[name] || exports;
                fn.apply(S, args);
            });
        };
    });

})(tbtx);