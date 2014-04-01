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
        FALSE = false,
        TRUE = true,
        shimType = "function",
        spliter = " ";

    /**
     * Object.keys
     */
    if (typeof Object.keys != shimType) {
        var hasEnumBug = !({
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
                        result.push(p);
                    }
                }
            }

            return ret;
        };
    }
    S.keys = function(o) {
        return Object.keys(o);
    };

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
    S.Now = function() {
        return Date.now();
    };

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
                .replace(trimBeginRegexp, "")
                .replace(trimEndRegexp, "");
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

            fromIndex = fromIndex * 1 || 0;
            i = fromIndex;
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
            if (!object) {
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

                    if (!object.length) {
                        if (name == "filter" && ret) {
                            result = result || {};
                            result[key] = item;
                        }
                        if (name == "map") {
                            result = result || {};
                            result[key] = ret;
                        }
                    }
                    return ret;
                });
                return result || process;
            }
        };
    });

    // return false终止循环
    var each = S.each = function(object, fn, context) {
        if (object) {
            var key,
                val,
                keys,
                i = 0,
                length = object.length,
                // do not use typeof obj == 'function': bug in phantomjs
                isObj = length === undefined || type(object) == 'function';

            context = context || null;

            if (isObj) {
                keys = Object.keys(object);
                length = keys.length;
                for (; i < length; i++) {
                    key = keys[i];
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
    };

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
    "Boolean Number String Function Array Date RegExp Object".split(spliter).forEach(function(name, lc) {
        class2type["[object " + name + "]"] = (lc = name.toLowerCase());
        S['is' + name] = function(o) {
            return type(o) === lc;
        };
    });
    var isArray = Array.isArray = S.isArray = Array.isArray || S.isArray;

    var EMPTY = '',

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
                class2type[toString.call(obj)] || 'object';
        },

        inArray = function(array, item) {
            return array.indexOf(item) > -1;
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
            if (o === null || o === undefined) {
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
                (oType === 'function' && !('item' in o && lengthType === 'number'))) {
                return [o];
            }
            var ret = [];
            for (var i = 0, l = o.length; i < l; i++) {
                ret[i] = o[i];
            }
            return ret;
        },

        deepCopy = function(obj) {
            if (!obj || 'object' !== typeof obj) {
                return obj;
            }
            var o = isArray(obj) ? [] : {},
                i;

            for (i in obj) {
                if (obj.hasOwnProperty(i)) {
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

            random = Math.floor(Math.random() * (n - m) + m);
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
        getEscapeReg = singleton(function() {
            var str = EMPTY;
            S.forEach(htmlEntities, function(entity, index) {
                str += entity + '|';
            });
            str = str.slice(0, -1);
            return new RegExp(str, 'g');
        }),
        getUnEscapeReg = singleton(function() {
            var str = EMPTY;
            S.forEach(reverseEntities, function(entity, index) {
                str += entity + '|';
            });
            str += '&#(\\d{1,5});';

            return new RegExp(str, 'g');
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

    (function() {
        for (var k in htmlEntities) {
            reverseEntities[htmlEntities[k]] = k;
        }
    })();


    // oo实现
    var Class = function(parent, properties) {
        if (!this instanceof Class) {
            return new Class(parent, properties);
        }
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

        // klass.Implements(makeArray(properties['Implements']));
        return klass.include(properties);
    };

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
        extend: function(properties) {
            // var extended = object.extended;

            mix(this, properties);

            // if (extended) {
            //     extended(this);
            // }
            return this;
        },
        include: function(properties) {
            // var included = object.included;
            var fn = this.prototype;
            var Mutators = Class.Mutators;

            var key, value;
            for (key in properties) {
                value = properties[key];
                if (hasOwnProperty(Mutators, key)) {
                    Mutators[key].call(this, value);
                } else {
                    fn[key] = value;
                }
            }

            // mix(this.prototype, properties);

            // if (included) {
            //     included(this);
            // }
            return this;
        },
        proxy: function(fn) {
            return fn.bind(this);
        },
        Implements: Implements
    };

    function Implements(items) {
        if (!isArray(items)) {
            items = [items];
        }
        var proto = this.prototype || this,
            item = items.shift();
        while (item) {
            mix(proto, item.prototype || item, ['prototype']);
            item = items.shift();
        }
        return this;
    }

    function classify(cls) {
        cls.Implements = Implements;
        return cls;
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
        if (typeof over != "boolean") {
            over = TRUE;
        }
        blacklist = blacklist || [];

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

    /**
     * util
     */

    function hasOwnProperty(o, p) {
        return OP.hasOwnProperty.call(o, p);
    }

    function isValidParamValue(val) {
        var t = typeof val;
        // If the type of val is null, undefined, number, string, boolean, return TRUE.
        return val === null || (t !== 'object' && t !== 'function');
    }

    // S
    S.mix({

        mix: mix,

        Class: Class,
        classify: classify,

        isNotEmptyString: function(val) {
            return S.isString(val) && val !== '';
        },

        isEmptyObject: function(o) {
            for (var p in o) {
                if (p !== undefined) {
                    return FALSE;
                }
            }
            return TRUE;
        },

        pluck: function(object, name) {
            var names = name.split(".");
            return S.map(object, function(v, k, object) {
                for (var i = 0; i < names.length; i++) {
                    v = v[names[i]];
                }
                return v;
            });
        },

        isPlainObject: isPlainObject,
        inArray: inArray,
        type: type,
        makeArray: makeArray,
        deepCopy: deepCopy,

        /**
         * 判断jQuery deferred对象是否正在处理中
         * @param  {deferred object}
         * @return {Boolean}
         */
        isPending: function(val) {
            // dark type
            if (val && S.isFunction(val.state)) {
                return val.state() === "pending";
            }
            return FALSE;
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
        later: function(fn, when, periodic, context, data) {
            when = when || 0;
            var m = fn,
                d = makeArray(data),
                f,
                r;

            if (typeof fn === 'string') {
                m = context[fn];
            }

            if (!m) {
                S.error('later: method undefined');
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

        /**
         * return sizeof a str
         * 匹配双字节字符(包括汉字在内)
         * @param  {String} str the input str
         * @return {number}     the sizeof the str
         */
        sizeof: function(str) {
            return String(str).replace(/[^\x00-\xff]/g, "aa").length;
        },

        namespace: function() {
            var args = makeArray(arguments),
                l = args.length,
                o = this,
                i, j, p;

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

        /**
         * 在underscore里面有实现，这个版本借鉴的是kissy
         */
        throttle: function(fn, ms, context) {
            ms = ms || 100; // 150 -> 100

            if (ms === -1) {
                return (function() {
                    fn.apply(context || this, arguments);
                });
            }

            var last = S.Now();

            return (function() {
                var now = S.Now();
                if (now - last > ms) {
                    last = now;
                    fn.apply(context || this, arguments);
                }
            });
        },

        debounce: function(fn, ms, context) {
            ms = ms || 150;
            if(ms === -1) {
                return function() {
                    fn.apply(context || this, arguments);
                };
            }
            var timer = null;
            var f = function() {
                f.stop();
                timer = S.later(fn, ms, 0, context || this, arguments);
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
         * 函数柯里化
         * 调用同样的函数并且传入的参数大部分都相同的时候，就是考虑柯里化的理想场景
         */
        curry: function(fn) {
            var args = slice.call(arguments, 1);

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
                return (o[name] === undefined) ? '' : o[name];
            });
        },

        param: function(o, sep, eq, serializeArray) {
            sep = sep || '&';
            eq = eq || '=';
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
        unparam: function(str, sep, eq) {
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
                        S.log(e + 'decodeURIComponent error : ' + val, 'error');
                    }
                }
                ret[key] = val;
            }
            return ret;
        },

        escapeHtml: escapeHtml,
        unEscapeHtml: unEscapeHtml
    });
})(this, tbtx, undefined);
