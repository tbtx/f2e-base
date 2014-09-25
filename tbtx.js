/**
 * @name:       tbtx-base-js
 * @author:     shiyi_tbtx
 * @email:      tb_dongshuang.xiao@taobao.com
 * @version:    v2.5.0
 * @buildTime:  Thu Sep 25 2014 18:06:20 GMT+0800 (中国标准时间)
 */
(function(global, document, S, undefined) {

var location = global.location,

    ua = navigator.userAgent,

    documentElement = document.documentElement,

    head = document.head || document.getElementsByTagName("head")[0] || documentElement,

    isSupportConsole = global.console && console.log,

    noop = function() {},

    error = function (msg) {
        throw isError(msg) ? msg : new Error(msg);
    },

    /**
     * 配置getter/setter
     * @type {Object}
     */
    ConfigFns = {},

    /**
     * 配置对象
     * @type {Object}
     */
    Config = {
        debug: location.search.indexOf("debug") !== -1 ? true : false,
        fns: ConfigFns
    };

S = global[S] = {

    version: "2.5",

    /**
     * 在log环境下输出log信息，避免因为忘记删除log语句而引发错误
     * @param  {String} msg 消息
     * @param  {String} src 消息来源，可选
     * @return {Object}     返回this以链式调用，如S.log().log()
     */
    log: isSupportConsole ? function(msg, src) {
        if (S.config("debug")) {
            if (src) {
                msg = src + ": " + msg;
            }
            console.log(msg);
        }

        return S;
    } : noop,

    /**
     * Throws error message.
     */
    error: error,

    /**
     * global对象，在浏览器环境中为window
     * @type {Object}
     */
    global: global,

    /**
     * 空函数，在需要使用空函数作为参数时使用
     */
    noop: noop,

    Config: Config,

    config: function(key, value) {
        var self = S,
            Config = self.Config,
            fns = Config.fns,
            fn,
            ret = self;

        if (isString(key)) {
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
            // Object config
            each(key, function(v, k) {
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



/**
* Uri 相关
*/
var encode = encodeURIComponent,

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
                    buf.push(eq, encode(val));
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
    unparam = function(str, sep, eq) {
        str = (str + "").trim();
        sep = sep || "&";
        eq = eq || "=";

        var ret = {},
            eqIndex,
            pairs = str.split(sep),
            key,
            val,
            i = 0,
            length = pairs.length;

        if (!str) {
            return ret;
        }

        for (; i < length; ++i) {
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
                    error(e);
                }
            }
            ret[key] = val;
        }
        return ret;
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

    uriInfo = {
        scheme: 1,
        credentials: 2,
        domain: 3,
        port: 4,
        path: 5,
        query: 6,
        fragment: 7
    },

    getComponents = function(uri) {
        uri = uri || location.href;

        var m = uri.match(ruri) || [],
            ret = {};

        each(uriInfo, function(index, key) {
            // 默认为""
            ret[key] = m[index] || "";
        });

        return ret;
    },

    Query = function(query) {
        this._query = query;
        this._map = unparam(query);
    },

    Uri = function(uriStr) {
        var uri = this,
            components = getComponents(uriStr);

        each(components, function(v, key) {

            if (key === "query") {
                // need encoded content
                uri.query = new Query(v);
            } else {
                // https://github.com/kissyteam/kissy/issues/298
                try {
                    v = decode(v);
                } catch (e) {
                    error(e);
                }
                // need to decode to get data structure in memory
                uri[key] = v;
            }
        });

        return uri;
    },

    isUri = function(val) {
        val = val + "";

        var first = val.charAt(0),
            match;

        // root and relative
        if (first === "/" || first === ".") {
            return true;
        }

        match = ruri.exec(val);
        // scheme
        if (match) {
            // http://a.com
            // file:/// -> no domain
            return !!((match[1] && match[3]) || (match[1] && match[5]));
        }
        return false;
    };


Query.prototype = {

    /**
     * Return parameter value corresponding to current key
     * @param {String} [key]
     */
    get: function(key) {
        var map = this._map;
        return key ? map[key] : map;
    },

    /**
     * Set parameter value corresponding to current key
     * @param {String} key
     * @param value
     * @chainable
     */
    set: function(key, value) {
        var query = this,
            map = query._map;

        if (isString(key)) {
            map[key] = value;
        } else {
            if (key instanceof Query) {
                key = key.get();
            }
            each(key, function(v, k) {
                map[k] = v;
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
            each(key, function(k) {
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
};

Query.prototype.add = Query.prototype.set;

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


function isValidParamValue(val) {
    var t = typeof val;
    // If the type of val is null, undefined, number, string, boolean, return TRUE.
    return val === null || (t !== "object" && t !== "function");
}

/**
 * get/set/remove/add QueryParam
 * uri, args... or args.., uri
 */
"add get remove set".replace(rword, function(name) {
    S[name + "QueryParam"] = function() {
        var args = makeArray(arguments),
            length = args.length,
            uriStr;

        // 第一个跟最后一个参数都可能是uri
        if (isUri(args[0])) {
            uriStr = args.shift();
        } else if (isUri(args[length - 1])) {
            uriStr = args.pop();
        }

        var uri = new Uri(uriStr),
            query = uri.query,
            ret = query[name].apply(query, args);

        return ret === query ? uri.toString() : ret || "";
    };
});

S.mix({
    Query: Query,
    Uri: Uri,

    urlEncode: encode,
    urlDecode: decode,

    param: param,
    unparam: unparam,

    isUri: isUri,

    parseUri: getComponents,

    getFragment: function(uri) {
        return new Uri(uri).getFragment();
    }
});
/**
 * events
 */
var events = S.events = {};

// Bind event
S.on = function(name, callback) {
    var list = events[name] || (events[name] = []);
    list.push(callback);
    return S;
};

// Remove event. If `callback` is undefined, remove all callbacks for the
// event. If `event` and `callback` are both undefined, remove all callbacks
// for all events
S.off = function(name, callback) {
    // Remove *all* events
    if (!(name || callback)) {
        events = S.events = {};
        return S;
    }

    var list = events[name];
    if (list) {
        if (callback) {
            for (var i = list.length - 1; i >= 0; i--) {
                if (list[i] === callback) {
                    list.splice(i, 1);
                }
            }
        } else {
            delete events[name];
        }
    }

    return S;
};

// Emit event, firing all bound callbacks. Callbacks receive the same
// arguments as `emit` does, apart from the event name
var trigger = S.trigger = function(name, data) {
    var list = events[name];

    if (list) {
        // Copy callback lists to prevent modification
        list = list.slice();

        // Execute event callbacks, use index because it's the faster.
        for (var i = 0, len = list.length; i < len; i++) {
            list[i](data);
        }
    }

    return S;
};


// thanks modernizr
var element = document.createElement("tbtx"),
    style = element.style,
    spliter = " ",
    omPrefixes = "Webkit Moz O ms",
    cssomPrefixes = omPrefixes.split(spliter),

    prefixed = function(prop) {
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
    testPropsAll = function(prop, prefixed) {
        var ucProp = ucfirst(prop),
            props = (prop + spliter + cssomPrefixes.join(ucProp + spliter) + ucProp).split(spliter);

        return testProps(props, prefixed);
    },

    touch = "ontouchstart" in documentElement,
    mobile = !!ua.match(/AppleWebKit.*Mobile.*/) || touch,
    pad = !!ua.match(/iPad/i),
    phone = mobile && !pad;

// .add("canvas", function() {
//     var elem = document.createElement("canvas");
//     return !!(elem.getContext && elem.getContext("2d"));
// })

S.mix({
    support: {
        transition: testPropsAll("transition"),
        transform: testPropsAll("transform"),
        touch: touch,
        mobile: mobile,
        pad: pad,
        phone: phone,
        placeholder: "placeholder" in document.createElement("input")
    },
    testPropsAll: testPropsAll,
    prefixed: prefixed
});

/**
* an amd loader
* thanks [seajs](http://seajs.org/)
* 将seajs改造为一个amd加载器
* 尽量减少对seajs代码的修改
*/

var Loader = S.Loader = {},
    data = Loader.data = {},
    cid = cidGenerator(),

    DIRNAME_RE = /[^?#]*\//,
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

var cwd = dirname(location.href),
    scripts = document.scripts,
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

var baseElement = head.getElementsByTagName("base")[0],

    currentlyAddingScript,
    interactiveScript,
    IS_CSS_RE = /\.css(?:\?|$)/i,
    isOldWebKit = +navigator.userAgent
        .replace(/.*(?:AppleWebKit|AndroidWebKit)\/(\d+).*/, "$1") < 536;

function request(url, callback, charset) {
    callback = callback || noop;

    var isCSS = IS_CSS_RE.test(url),
        node = document.createElement(isCSS ? "link" : "script");

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
    if (document.currentScript) {
        return document.currentScript;
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

        return ids.map(function(id) {
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
data.fetchedList = fetchedList;

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
global.require = S.require = function(ids, callback) {
    Module.require(ids, callback, data.cwd + "_require_" + cid());
    return S;
};

S.mix({
    realpath: realpath,
    loadScript: request,
    loadCss: request
});



/**
 * 模块配置与注册
 * 只写常用的
 * @type {[type]}
 */
var staticUrl = S.staticUrl = realpath(loaderDir + "../../../"),

    paths = {},

    alias = {},

    aliasConfig = {

        component: {
            switchable: "1.0.3",
            validator: "0.9.7"
        },

        plugin: {

        },

        gallery: {
            jquery: "1.11.1",
            handlebars: "1.3.0",
            json: "2"
        }
    },

    // 目录规范
    dirPattern = "{{ dir }}/{{ name }}/{{ version }}/{{ name }}";

each(aliasConfig, function(config, dir) {

    paths[dir] = realpath(loaderDir + "../../") + dir;

    each(config, function(v, name) {
        alias[name] = substitute(dirPattern, {
            dir: dir,
            name: name,
            version: v
        });
    });
});

alias.$ = alias.jquery;

Loader.config({

    base: staticUrl,

    alias: alias,

    paths: paths

});

if (!S.config("debug")) {
    Loader.config({
        // 每小时更新时间戳
        map: [
            function(uri) {
                // if (S.inArray(["msg", "position", "request"], uri.slice(staticUrl.length, uri.length - 3))) {
                //     return;
                // }
                if (uri.indexOf("t=") === -1) {
                    return uri.replace(/^(.*\.(?:css|js))(.*)$/i, "$1?t=" + Math.floor(Date.now() / 3600000));
                }
            }
        ]
    });
}

"alias map paths".replace(rword, function(name) {
    ConfigFns[name] = function(val) {
        if (val) {
            var cfg = {};
            cfg[name] = val;
            Loader.config(cfg);
        } else {
            return data[name];
        }
    };
});


var jQuery = global.jQuery,
    jQueryFactory,
    JSON = global.JSON;

if (JSON) {
    define("json", JSON);
}

if (jQuery) {
    jQueryFactory = function() {
        return jQuery;
    };
    define("jquery", jQueryFactory);
    define("$", jQueryFactory);
}


})(typeof window !== "undefined" ? window : this, document, "tbtx");