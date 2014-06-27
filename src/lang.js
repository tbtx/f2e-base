/**
 * 语言扩展
 */
(function(S, undefined) {

    /*
     * shim first
     */
    var global = S.global,

        AP = Array.prototype,
        OP = Object.prototype,
        SP = String.prototype,
        FP = Function.prototype,

        toString = OP.toString,
        hasOwn = OP.hasOwnProperty,
        slice = AP.slice,

        hasOwnProperty = function(o, p) {
            return hasOwn.call(o, p);
        },

        EMPTY = "",

        rtrim = /^\s+|\s+$/g,
        //切割字符串为一个个小块，以空格或逗号分开它们，结合replace实现字符串的forEach
        rword = /[^, ]+/g,
        rsubstitute = /\\?\{\{\s*([^{}\s]+)\s*\}\}/g,
        rtags = /<[^>]+>/g,
        rscripts = /<script[^>]*>([\S\s]*?)<\/script>/img;

    /**
     * Object.keys
     */
    if (!Object.keys) {
        var hasEnumBug = !({
            toString: 1
        }.propertyIsEnumerable("toString")),
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
                if (hasOwnProperty(o, p)) {
                    ret.push(p);
                }
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
    S.bind = function(fn, context) {
        return fn.bind(context);
    };

    /**
     * Date.now
     */
    if (!Date.now) {
        Date.now = function() {
            return +new Date();
        };
    }
    S.Now = Date.now;

    if (!SP.trim) {
        SP.trim = function() {
            return this.replace(rtrim, EMPTY);
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

    "forEach map filter every some".replace(rword, function(name) {
        /**
         * iter object and array
         * only use when you want to iter both array and object, if only array, please use [].map/filter..
         * 要支持object, array, arrayLike object
         * @param  {Array/Object}   object      the object to iter
         * @param  {Function}       fn          the iter process fn
         * @return {Boolean/Array}              the process result
         */
        S[name] = function(object, fn, context) {
            if (!object) {
                return;
            }
            // 处理arrayLike object
            if (object.length === +object.length) {
                object = makeArray(object);
            }
            if (object[name] === AP[name]) {
                return object[name](fn, context);
            } else {
                var keys = Object.keys(object),
                    ret = {};

                if (S.inArray(["map", "filter"], name)) {
                    keys[name](function(key) {
                        var value = object[key],
                            item = fn.call(context, value, key, object);

                        if (name === "filter" && item) {
                            ret[key] = value;
                        }
                        if (name === "map") {
                            ret[key] = item;
                        }
                        return item;
                    });

                    return ret;
                } else {
                    return keys[name](function(key, value) {
                        value = object[key];
                        return fn.call(context, value, key, object);
                    });
                }
            }
        };
    });

    "reduce reduceRight".replace(rword, function(name) {
        S[name] = function(array, fn, initialValue) {
            if (array.length === +array.length) {
                array = makeArray(array);
            }
            if (initialValue === undefined) {
                return array[name](fn);
            }
            return array[name](fn, initialValue);
        };
    });

    "indexOf lastIndexOf".replace(rword, function(name) {
        S[name] = function(array, searchElement, fromIndex) {
            // indexOf对string能同样使用
            if (array.length === +array.length && !isString(array)) {
                array = makeArray(array);
            }
            return array[name](searchElement, fromIndex);
        };
    });

    var class2type = {};
    "Boolean Number String Function Array Date RegExp Object".replace(rword, function(name, lc) {
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
        if (!object) {
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
            keys = Object.keys(object);
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
     * 单例模式
     * return only one instance
     * @param  {Function} fn      the function to return the instance
     * @param  {object}   context
     * @return {Function}
     */
    var singleton = function(fn, context) {
            var result;
            return function() {
                return result || (result = fn.apply(context, arguments));
            };
        },

        /**
         * jQuery type()
         */
        type = function(object) {
            return object == null ?
                String(object) :
                class2type[toString.call(object)] || "object";
        },

        isWindow = function(object) {
            return object != null && object === object.window;
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
                lengthType = typeof length,
                oType = typeof o;

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
            var str = EMPTY;
            each(htmlEntities, function(entity) {
                str += entity + "|";
            });
            str = str.slice(0, -1);
            return new RegExp(str, "g");
        }),
        getUnEscapeReg = singleton(function() {
            var str = EMPTY;
            each(reverseEntities, function(entity) {
                str += entity + "|";
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

    each(htmlEntities, function(entity, k) {
        reverseEntities[entity] = k;
    });

    var cidCounter = 0;
    // S
    S.mix({
        rword: rword,

        uniqueCid: function() {
            return cidCounter++;
        },

        nextTick: global.setImmediate ? setImmediate.bind(global) : function(callback) {
            setTimeout(callback, 0);
        },

        isNotEmptyString: function(val) {
            return isString(val) && val !== EMPTY;
        },

        isWindow: isWindow,

        isPlainObject: isPlainObject,

        extend: extend,

        inArray: function(array, item) {
            return array.indexOf(item) > -1;
        },

        erase: function(target, array) {
            var index = array.indexOf(target);
            if (index > -1) {
                array.splice(index, 1);
            }
            return array;
        },

        type: type,

        makeArray: makeArray,

        singleton: singleton,

        unique: function(array) {
            var hash = {};

            return array.filter(function(item) {
                var key = typeof(item) + item;
                if (hash[key] !== 1) {
                    hash[key] = 1;
                    return true;
                }
                return false;
            });
        },

        namespace: function() {
            var args = arguments,
                l = args.length,
                o = this,
                i, j, p;

            for (i = 0; i < l; i++) {
                p = (EMPTY + args[i]).split(".");
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
            return index >= 0 && str.indexOf(suffix, index) === index;
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
         * based on Django, fix kissy, support BLANK -> {{ name }}, not only {{name}}
         */
        substitute: function(str, o, regexp) {
            if (!isString(str)) {
                return str;
            }
            if (!(isPlainObject(o) || isArray(o))) {
                return str;
            }
            return str.replace(regexp || rsubstitute, function(match, name) {
                if (match.charAt(0) === '\\') {
                    return match.slice(1);
                }
                return (o[name] === undefined) ? EMPTY : o[name];
            });
        },

        // 去除字符串中的html标签
        stripTags: function(str) {
            return (str + EMPTY).replace(rtags, EMPTY);
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
                ].join(EMPTY), "img");

            }

            return (str + EMPTY).replace(pattern || rscripts, EMPTY);
        },

        /**
         * 对字符串进行截断处理
         */
        truncate: function(str, length, truncation) {
            str = str + EMPTY;
            truncation = truncation || "...";

            return str.length > length ? str.slice(0, length - truncation.length) + truncation : str;
        },

        escapeHtml: escapeHtml,
        unEscapeHtml: unEscapeHtml
    });

})(tbtx);