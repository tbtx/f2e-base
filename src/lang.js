
/**
* 语言扩展
*/
var AP = Array.prototype,

    SP = String.prototype,

    FP = Function.prototype,

    class2type = {},

    toString = class2type.toString,

    hasOwn = class2type.hasOwnProperty,

    slice = AP.slice,

    hasOwnProperty = function(o, p) {
        return hasOwn.call(o, p);
    },

    rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

    //切割字符串为一个个小块，以空格或逗号分开它们，结合replace实现字符串的forEach
    rword = /[^, ]+/g,

    // 是否是复杂类型
    // rcomplexType = /^(?:object|array)$/,

    rsubstitute = /\\?\{\{\s*([^{}\s]+)\s*\}\}/mg,

    /**
     * return false终止循环
     * 原生every必须return true or false
     */
    each = function(object, fn, context) {
        var i = 0,
            length = object.length;

        if (context) {
            fn = fn.bind(context);
        }
        if (length === +length) {
            for (; i < length; i++) {
                if (fn(object[i], i, object) === false) {
                    break;
                }
            }
        } else {
            for (i in object) {
                if (hasOwnProperty(object, i) && (fn(object[i], i, object) === false)) {
                    break;
                }
            }
        }
    };

/**
 * Object.keys
 * 不支持enum bug
 */
if (!Object.keys) {
    Object.keys = function(o) {
        var ret = [],
            p;

        for (p in o) {
            if (hasOwnProperty(o, p)) {
                ret.push(p);
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
                return fn.apply(this instanceof noop? this : context || global, args.concat(slice.call(arguments)));
            };

        noop.prototype = fn.prototype;
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
    SP.trim = function() {
        return this.replace(rtrim, "");
    };
}

if (!SP.startsWith) {
    SP.startsWith = function(search) {
        return this.lastIndexOf(search, 0) === 0;
    };
}

if (!SP.endsWith) {
    SP.endsWith = function(search) {
        var index = this.length - search.length;
        return index >= 0 && this.indexOf(search, index) === index;
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

"Boolean Number String Function Array Date RegExp Object Error".replace(rword, function(name, lc) {
    class2type["[object " + name + "]"] = (lc = name.toLowerCase());
    S["is" + name] = function(o) {
        return type(o) === lc;
    };
});

var isArray = Array.isArray = S.isArray = Array.isArray || S.isArray,
    isFunction = S.isFunction,
    isObject = S.isObject,
    isString = S.isString,
    isError = S.isError,
    isDate = S.isDate,

    isNotEmptyString = function(val) {
        return isString(val) && val !== "";
    },

    memoize = function(fn, hasher) {
        var memo = {};

        // 默认拿第一个传入的参数做key
        hasher = hasher || function(val) {
            return val;
        };

        return function() {
            var args = arguments,
                key = hasher.apply(this, args),
                val = memo[key];

            // 必须有返回结果才缓存
            return hasOwnProperty(memo, key) && val != null ? memo[key] : (memo[key] = fn.apply(this, args));
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
        if (context) {
            fn = fn.bind(context);
        }
        return memoize(fn, function() {
            return 1;
        });
    },

    /**
     * {{ name }} -> {{ o[name] }}
     * \{{}} -> \{{}}
     * reserve 是否保留{{ var }}来进行多次替换, 默认不保留，即替换为空
     */
    substitute = function(str, o, reserve) {
        if (!isString(str) && !isArray(o) && !isPlainObject(o)) {
            return str;
        }

        return str.replace(rsubstitute, function(match, name) {
            if (match.charAt(0) === '\\') {
                return match.slice(1);
            }
            return (o[name] == null) ? reserve ? match : "" : o[name];
        });
    },

    /**
     * jQuery type()
     */
    type = function(object) {
        if (object == null ) {
            return object + "";
        }

        var t = typeof object;
        return t === "object" || t === "function" ?
            class2type[toString.call(object)] || "object" :
            t;
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

    cidGenerator = function(prefix) {
        prefix = prefix || 0;

        var counter = 0;
        return function() {
            return prefix + counter++;
        };
    },

    ucfirst = function(str) {
        return str.charAt(0).toUpperCase() + str.substring(1);
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

extend(S, {

    each: each,

    mix: extend,

    extend: extend,

    isWindow: isWindow,

    isPlainObject: isPlainObject,

    type: type,

    makeArray: makeArray,

    memoize: memoize,
    singleton: singleton,

    cidGenerator: cidGenerator,
    uniqueCid: cidGenerator(),

    isNotEmptyString: isNotEmptyString,

    ucfirst: ucfirst,

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

    substitute: substitute,

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

