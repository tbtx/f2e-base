this["tbtx"] =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var lang = __webpack_require__(2),
	    extend = lang.extend;

	var modules = [
	    lang,
	    __webpack_require__(3),
	    __webpack_require__(4),
	    {
	        cookie: __webpack_require__(5)
	    },
	    __webpack_require__(1),
	    __webpack_require__(6),
	    __webpack_require__(7),
	    __webpack_require__(8)
	];

	for (var i = 0; i < modules.length; i++) {
	    extend(exports, modules[i]);
	};


/***/ },
/* 1 */
/***/ function(module, exports) {

	/**
	 * date module
	 */

	/**
	 * formate格式只有2014/07/12 12:34:35的格式可以跨平台
	 * new Date()
	 * new Date(时间戳)
	 * new Date(year, month, day[, hour[, minute[, second[, millisecond]]]])
	 */

	var rformat = /y|m|d|h|i|s/gi,
	    rnumberDate = /^\d{13}$/,
	    // from moment
	    // risoDate = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
	    rstringDate = /^(\d{4}-\d{2}-\d{2})(T| )(\d\d:\d\d:\d\d)$/;


	// 判断参数是否是日期格式
	// 支持数字，date
	// 字符串支持2015-10-11 05:03:02 2015-10-11T05:03:02
	function isDateFormat(val) {
	    return rnumberDate.test(val) || rstringDate.test(val)  || isDate(val);
	}

	function isDate(val) {
	    return val instanceof Date;
	}

	// 解析一个日期, 返回日期对象
	function makeDate(val) {
	    if (isDate(val)) {
	        return val;
	    }

	    if (rnumberDate.test(val)) {
	        return new Date(+val);
	    }

	    var match = rstringDate.exec(val);
	    if (match) {
	        return new Date(match[1].replace(/-/g, '/') + ' ' + match[3]);
	    }

	    return new Date();
	}

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
	 *
	 *  @return：指定格式的字符串
	 */
	function formatDate(format, date) {
	    // 交换参数
	    if (isDateFormat(format)) {
	        date = [format, format = date][0];
	    }

	    format = format || 'Y-m-d h:i:s';
	    var normalized = normalizeDate(date);

	    return format.replace(rformat, function(k) {
	        return normalized[k];
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
	    };

	    var normalized = {},
	        k,
	        v;

	    for (k in o) {
	        // 统一结果为字符串
	        v = o[k] + '';

	        normalized[k] = v;
	        normalized[k.toLowerCase()] = padding2(v).slice(-2);
	    }
	    return normalized;
	}

	function padding2(str) {
	    return str.length === 1 ? '0' + str : str;
	}

	module.exports = {
	    makeDate: makeDate,
	    normalizeDate: normalizeDate,
	    formatDate: formatDate
	};


/***/ },
/* 2 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {var app = {};

	/**
	* 语言扩展
	*/
	var class2type = {},

	    toString = class2type.toString,

	    hasOwn = class2type.hasOwnProperty,

	    isSupportConsole = global.console && console.log,

	    hasOwnProperty = function(o, p) {
	        return hasOwn.call(o, p);
	    },

	    noop = function() {},

	    counter = 0,

	    // 切割字符串为一个个小块，以空格或逗号分开它们，结合replace实现字符串的forEach
	    rword = /[^, ]+/g,

	    // 简单的模板替换
	    rsubstitute = /\\?\{\{\s*([^{}\s]+)\s*\}\}/g;

	'Boolean Number String Function Array Date RegExp Object Error'.replace(rword, function(name, lc) {
	    class2type['[object ' + name + ']'] = (lc = name.toLowerCase());
	    app['is' + name] = function(o) {
	        return type(o) === lc;
	    };
	});

	var isArray = Array.isArray = app.isArray = Array.isArray || app.isArray,
	    isFunction = app.isFunction,
	    isObject = app.isObject,
	    isString = app.isString,

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
	     * @return {Function}
	     */
	    singleton = function(fn) {
	        return memoize(fn, function() {
	            return 1;
	        });
	    },

	    /**
	     * jQuery type()
	     */
	    type = function(object) {
	        if (object == null ) {
	            return object + '';
	        }

	        var t = typeof object;
	        return t === 'object' || t === 'function' ?
	            class2type[toString.call(object)] || 'object' :
	            t;
	    },

	    makeArray = function(object) {
	        if (object == null) {
	            return [];
	        }
	        if (isArray(object)) {
	            return object;
	        }

	        var length = object.length,
	            lengthType = type(length),
	            oType = type(object);

	        if (lengthType !== 'number' ||
	            // form.elements in ie78 has nodeName 'form'
	            // then caution select
	            // o.nodeName
	            // window
	            object.alert ||
	            oType === 'string' ||
	            // https://github.com/ariya/phantomjs/issues/11478
	            (oType === 'function' && !('item' in object && lengthType === 'number'))
	        ) {
	            return [object];
	        }

	        var ret = [],
	            i = 0;
	        for (; i < length; i++) {
	            ret[i] = object[i];
	        }
	        return ret;
	    },

	    isPlainObject = function(object) {
	        // Must be an Object.
	        // Because of IE, we also have to check the presence of the constructor property.
	        // Make sure that Dom nodes and window objects don't pass through, as well
	        if (!isObject(object) || object.nodeType || object.window === object) {
	            return false;
	        }

	        var key, constructor;

	        try {
	            // Not own constructor property must be Object
	            if ((constructor = object.constructor) && !hasOwnProperty(object, 'constructor') && !hasOwnProperty(constructor.prototype, 'isPrototypeOf')) {
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

	    extend = function() {
	        var src, copyIsArray, copy, name, options, clone,
	            target = arguments[0] || {},
	            i = 1,
	            length = arguments.length,
	            deep = false;

	        // Handle a deep copy situation
	        if (typeof target === 'boolean') {
	            deep = target;

	            // skip the boolean and the target
	            target = arguments[i] || {};
	            i++;
	        }

	        // Handle case when target is a string or something (possible in deep copy)
	        if (typeof target !== 'object' && !isFunction(target)) {
	            target = {};
	        }

	        // extend itself if only one argument is passed
	        // if (i === length) {
	        //     target = S;
	        //     i--;
	        // }

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

	     /**
	     * [later description]
	     * @param  {Function} fn       要执行的函数
	     * @param  {number}   when     延迟时间
	     * @param  {boolean}   periodic 是否周期执行
	     * @param  {object}   context  context
	     * @param  {Array}   data     传递的参数
	     * @return {object}            timer，cancel and interval
	     */
	    later = function(fn, when, periodic, context, data) {
	        when = when || 0;
	        var m = fn,
	            d = makeArray(data),
	            f,
	            r;

	        if (isString(fn)) {
	            m = context[fn];
	        }

	        f = function() {
	            m.apply(context, d);
	        };

	        r = periodic ? setInterval(f, when) : setTimeout(f, when);

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
	     * 判断两个变量是否相等
	     * 数字特殊情况不做判断 如0 == -0
	     * regexp不特殊判断
	     */
	    isEqual = function(a, b) {

	        var ret = a === b,
	            aType,
	            bType;

	        if (ret || (a == null || b == null)) {
	            return ret;
	        }

	        aType = type(a);
	        bType = type(b);
	        /**
	         * type不同即不相等
	         */
	        if (aType !== bType) {
	            return false;
	        }

	        switch (aType) {
	            case 'array':
	            case 'object':
	                return compareObject(a, b);
	            /**
	             * new String('a')
	             */
	            case 'string':
	                return a === String(b);
	            case 'number':
	                return ret;
	            case 'date':
	            case 'boolean':
	                return +a === +b;
	        }

	        return ret;
	    },

	    compareObject = function(a, b) {
	        var p;

	        for (p in b) {
	            if (!hasOwnProperty(a, p) && hasOwnProperty(b, p)) {
	                return false;
	            }
	        }
	        for (p in a) {
	            if (!hasOwnProperty(b, p) && hasOwnProperty(a, p)) {
	                return false;
	            }
	        }
	        for (p in b) {
	            if (!isEqual(a[p], b[p])) {
	                return false;
	            }
	        }
	        if (isArray(a) && isArray(b) && a.length !== b.length) {
	            return false;
	        }
	        return true;
	    },

	    // 转为下划线风格
	    underscored = function(str) {
	        return str.replace(/([a-z\d])([A-Z])/g, '$1_$2').replace(/\-/g, '_').toLowerCase();
	    },

	    htmlEntities = {
	        '&amp;': '&',
	        '&gt;': '>',
	        '&lt;': '<',
	        '&#x60;': '`',
	        '&#x2F;': '/',
	        '&quot;': '"',
	        /*jshint quotmark:false*/
	        '&#x27;': "'"
	    },
	    reverseEntities = {},
	    getEscapeReg = singleton(function() {
	        var str = '';
	        each(htmlEntities, function(entity) {
	            str += entity + '|';
	        });
	        str = str.slice(0, -1);
	        return new RegExp(str, 'g');
	    }),
	    getUnEscapeReg = singleton(function() {
	        var str = '';
	        each(reverseEntities, function(entity) {
	            str += entity + '|';
	        });
	        str += '&#(\\d{1,5});';

	        return new RegExp(str, 'g');
	    });

	each(htmlEntities, function(entity, k) {
	    reverseEntities[entity] = k;
	});

	extend(app, {
	    rword: rword,
	    noop: noop,
	    each: each,
	    extend: extend,
	    type: type,
	    makeArray: makeArray,
	    memoize: memoize,
	    singleton: singleton,

	    /**
	     * 在log环境下输出log信息，避免因为忘记删除log语句而引发错误
	     * @param  {String} msg 消息
	     * @param  {String} src 消息来源，可选
	     */
	    log: isSupportConsole ? function(msg, src) {
	        if (src) {
	            msg = src + ': ' + msg;
	        }
	        console.log(msg);

	        return this;
	    } : noop,

	    isPlainObject: isPlainObject,
	    isEqual: isEqual,

	    uniqueCid: function() {
	        return counter++;
	    },

	    ucfirst: function(str) {
	        return str.charAt(0).toUpperCase() + str.substring(1);
	    },

	    underscored: underscored,
	    // 转为连字符风格
	    dasherize: function(str) {
	        return underscored(str).replace(/_/g, '-');
	    },
	    // 转为驼峰
	    camelize: function(str){
	        return str.replace(/[-_][^-_]/g, function(match) {
	            return match.charAt(1).toUpperCase();
	        });
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

	    later: later,

	    /**
	     * 在underscore里面有实现，这个版本借鉴的是kissy
	     */
	    throttle: function(fn, ms, context) {
	        ms = ms || 150;

	        if (ms === -1) {
	            return fn.bind(context);
	        }

	        var last = Date.now();

	        return function() {
	            var now = Date.now();
	            if (now - last > ms) {
	                last = now;
	                fn.apply(context || this, arguments);
	            }
	        };
	    },

	    debounce: function(fn, ms, context) {
	        ms = ms || 150;

	        if (ms === -1) {
	            return fn.bind(context);
	        }
	        var timer = null,
	            f = function() {
	                f.stop();
	                timer = later(fn, ms, 0, context || this, arguments);
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
	     * reserve 是否保留{{ var }}来进行多次替换, 默认不保留，即替换为空
	     */
	    substitute: function(str, o, reserve) {
	        if (!isString(str) || (!isArray(o) && !isPlainObject(o))) {
	            return str;
	        }

	        return str.replace(rsubstitute, function(match, name) {
	            if (match.charAt(0) === '\\') {
	                return match.slice(1);
	            }
	            return (o[name] == null) ? (reserve ? match : '') : o[name];
	        });
	    },

	    /**
	     * 对字符串进行截断处理
	     */
	    truncate: function(str, length, truncation) {
	        str += '';
	        truncation = truncation || '...';

	        return str.length > length ? str.slice(0, length - truncation.length) + truncation : str;
	    },

	    escapeHtml: function(str) {
	        return (str + '').replace(getEscapeReg(), function(all) {
	            return reverseEntities[all];
	        });
	    },
	    unEscapeHtml: function(str) {
	        return (str + '').replace(getUnEscapeReg(), function(all) {
	            return htmlEntities[all];
	        });
	    },

	    startsWith: function(str, prefix) {
	        return str.lastIndexOf(prefix, 0) === 0;
	    },

	    endsWith: function(str, suffix) {
	        var index = str.length - suffix.length;
	        return index >= 0 && str.indexOf(suffix, index) === index;
	    }
	});

	module.exports = app;

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 3 */
/***/ function(module, exports) {

	var __config = {
	    debug: location.search.indexOf('debug') !== -1 ? true : false
	};

	module.exports = {

	    version: '3.0',

	    config: function(key, val) {
	        var ret = this,
	            k,
	            object;

	        if (typeof key === 'string') {
	            // get config
	            if (val === undefined) {
	                ret = __config[key];
	            } else { // set config
	                __config[key] = val;
	            }
	        } else {
	            // Object config
	            object = key;
	            for (k in object) {
	                if (object.hasOwnProperty(k)) {
	                    __config[k] = object[k];
	                }
	            }
	        }

	        return ret;
	    },

	    __data: {
	        config: __config
	    }
	};

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var lang = __webpack_require__(2),
	    each = lang.each,
	    isArray = lang.isArray,
	    endsWith =  lang.endsWith,
	    makeArray = lang.makeArray,

	    app = {};

	/**
	* Uri 相关
	*/
	var encode = encodeURIComponent,

	    decode = function(s) {
	        try {
	            return decodeURIComponent(s.replace(/\+/g, ' '));
	        } catch (err) {
	            return s;
	        }
	    },

	    param = function(o, sep, eq, serializeArray) {
	        sep = sep || '&';
	        eq = eq || '=';
	        if (serializeArray === undefined) {
	            serializeArray = true;
	        }

	        var buf = [], key, i, v, len, val;

	        for (key in o) {

	            val = o[key];
	            key = encode(key);

	            // val is valid non-array value
	            if (isValidParamValue(val)) {
	                buf.push(key);
	                if (val !== undefined) {
	                    buf.push(eq, encode(val + ''));
	                }
	                buf.push(sep);
	            }
	            // val is not empty array
	            else if (isArray(val) && val.length) {
	                for (i = 0, len = val.length; i < len; ++i) {
	                    v = val[i];
	                    if (isValidParamValue(v)) {
	                        buf.push(key, (serializeArray ? encode('[]') : ''));
	                        if (v !== undefined) {
	                            buf.push(eq, encode(v + ''));
	                        }
	                        buf.push(sep);
	                    }
	                }
	            }
	            // ignore other cases, including empty array, Function, RegExp, Date etc.

	        }
	        buf.pop();
	        return buf.join('');
	    },

	    /**
	     * query字符串转为对象
	     */
	    unparam = function(str, sep, eq) {
	        str = (str + '').trim();
	        sep = sep || '&';
	        eq = eq || '=';

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
	                val = decode(pairs[i].substring(eqIndex + 1));

	                if (endsWith(key, '[]')) {
	                    key = key.substring(0, key.length - 2);
	                }
	            }
	            if (key in ret) {
	                if (isArray(ret[key])) {
	                    ret[key].push(val);
	                } else {
	                    ret[key] = [ret[key], val];
	                }
	            } else {
	                ret[key] = val;
	            }
	        }
	        return ret;
	    },

	    parseUri = function(uri) {
	        uri = uri || location.href;

	        var a = document.createElement('a'),
	            protocol,
	            path,
	            port;

	        a.href = uri;
	        protocol = a.protocol;
	        protocol = protocol.slice(0, protocol.length - 1);

	        path = a.pathname;
	        // IE10 pathname返回不带/
	        if (path.charAt(0) !== '/') {
	            path = '/' + path;
	        }

	        port = a.port;
	        if (port == 80) {
	            port = '';
	        }

	        return {
	            scheme: protocol,
	            domain: a.hostname,
	            port: port,
	            path: path,
	            query: a.search.slice(1),
	            fragment: a.hash.slice(1)
	        };
	    },

	    Query = function(query) {
	        this._query = query;
	        this._map = unparam(query);
	    },

	    Uri = function(uriStr) {
	        var uri = this,
	            components = parseUri(uriStr);

	        each(components, function(v, key) {
	            uri[key] = key === 'query' ? new Query(v) : decode(v);
	        });

	        return uri;
	    },

	    ruri = /^(http|file|\/)/,

	    /**
	     * 简单判断
	     * 以http,file,/开头的为uri
	     */
	    isUri = function(val) {
	        return ruri.test(val);
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

	        if (typeof key === 'string') {
	            map[key] = value;
	        } else {
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

	Uri.prototype = {
	    toString: function() {
	        var ret = [],
	            uri = this,
	            scheme = uri.scheme,
	            domain = uri.domain,
	            path = uri.path,
	            // fix port '0' bug
	            port = parseInt(uri.port, 10),
	            fragment = uri.fragment,
	            query = uri.query.toString();

	        if (scheme) {
	            ret.push(scheme);
	            ret.push(':');
	        }

	        if (domain) {
	            ret.push('//');

	            ret.push(encode(domain));

	            if (port) {
	                ret.push(':');
	                ret.push(port);
	            }
	        }

	        if (path) {
	            ret.push(path);
	        }

	        if (query) {
	            ret.push('?');
	            ret.push(query);
	        }

	        if (fragment) {
	            ret.push('#');
	            ret.push(fragment);
	        }

	        return ret.join('');
	    }
	};


	function isValidParamValue(val) {
	    var t = typeof val;
	    // If the type of val is null, undefined, number, string, boolean, return TRUE.
	    return val === null || (t !== 'object' && t !== 'function');
	}

	/**
	 * get/set/remove/add QueryParam
	 * uri, args... or args.., uri
	 */
	'add get remove set'.replace(lang.rword, function(name) {
	    app[name + 'QueryParam'] = function() {
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
	            ret = query[name === 'add' ? 'set' : name].apply(query, args);

	        return ret === query ? uri.toString() : ret || '';
	    };
	});

	lang.extend(app, {
	    urlEncode: encode,
	    urlDecode: decode,
	    param: param,
	    unparam: unparam,

	    isUri: isUri,

	    parseUri: parseUri,

	    getHash: function(uri) {
	        return parseUri(uri).fragment;
	    }
	});

	module.exports = app;

/***/ },
/* 5 */
/***/ function(module, exports) {

	/**
	 * cookie module
	 * export get/set/remove
	 */

	var MILLISECONDS_OF_DAY = 24 * 60 * 60 * 1000,

	    encode = encodeURIComponent,

	    decode = function(val) {
	        return decodeURIComponent((val + '').replace(/\+/g, ' '));
	    },

	    isNotEmptyString = function(val) {
	        return typeof val === 'string' && val !== '';
	    };

	module.exports = {
	    /**
	     * 获取 cookie 值
	     * @return {string} 如果 name 不存在，返回 undefined
	     */
	    get: function(name) {
	        var ret, m;

	        if (isNotEmptyString(name)) {
	            if ((m = String(document.cookie).match(
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

	        document.cookie = name + '=' + text;
	        return this;
	    },

	    remove: function(name, domain, path, secure) {
	        // 置空，并立刻过期
	        this.set(name, '', domain, -1, path, secure);
	        return this;
	    }
	};

/***/ },
/* 6 */
/***/ function(module, exports) {

	// Events
	// -----------------
	// https://github.com/aralejs/events
	// Thanks to:
	//  - https://github.com/documentcloud/backbone/blob/master/backbone.js
	//  - https://github.com/joyent/node/blob/master/lib/events.js


	// Regular expression used to split event strings
	var eventSplitter = /\s+/


	// A module that can be mixed in to *any object* in order to provide it
	// with custom events. You may bind with `on` or remove with `off` callback
	// functions to an event; `trigger`-ing an event fires all callbacks in
	// succession.
	//
	//     var object = new Events();
	//     object.on('expand', function(){ alert('expanded'); });
	//     object.trigger('expand');
	//
	function Events() {
	}


	// Bind one or more space separated events, `events`, to a `callback`
	// function. Passing `"all"` will bind the callback to all events fired.
	Events.prototype.on = function(events, callback, context) {
	  var cache, event, list
	  if (!callback) return this

	  cache = this.__events || (this.__events = {})
	  events = events.split(eventSplitter)

	  while (event = events.shift()) {
	    list = cache[event] || (cache[event] = [])
	    list.push(callback, context)
	  }

	  return this
	}

	Events.prototype.once = function(events, callback, context) {
	  var that = this
	  var cb = function() {
	    that.off(events, cb)
	    callback.apply(context || that, arguments)
	  }
	  return this.on(events, cb, context)
	}

	// Remove one or many callbacks. If `context` is null, removes all callbacks
	// with that function. If `callback` is null, removes all callbacks for the
	// event. If `events` is null, removes all bound callbacks for all events.
	Events.prototype.off = function(events, callback, context) {
	  var cache, event, list, i

	  // No events, or removing *all* events.
	  if (!(cache = this.__events)) return this
	  if (!(events || callback || context)) {
	    delete this.__events
	    return this
	  }

	  events = events ? events.split(eventSplitter) : keys(cache)

	  // Loop through the callback list, splicing where appropriate.
	  while (event = events.shift()) {
	    list = cache[event]
	    if (!list) continue

	    if (!(callback || context)) {
	      delete cache[event]
	      continue
	    }

	    for (i = list.length - 2; i >= 0; i -= 2) {
	      if (!(callback && list[i] !== callback ||
	          context && list[i + 1] !== context)) {
	        list.splice(i, 2)
	      }
	    }
	  }

	  return this
	}


	// Trigger one or many events, firing all bound callbacks. Callbacks are
	// passed the same arguments as `trigger` is, apart from the event name
	// (unless you're listening on `"all"`, which will cause your callback to
	// receive the true name of the event as the first argument).
	Events.prototype.trigger = function(events) {
	  var cache, event, all, list, i, len, rest = [], args, returned = true;
	  if (!(cache = this.__events)) return this

	  events = events.split(eventSplitter)

	  // Fill up `rest` with the callback arguments.  Since we're only copying
	  // the tail of `arguments`, a loop is much faster than Array#slice.
	  for (i = 1, len = arguments.length; i < len; i++) {
	    rest[i - 1] = arguments[i]
	  }

	  // For each event, walk through the list of callbacks twice, first to
	  // trigger the event, then to trigger any `"all"` callbacks.
	  while (event = events.shift()) {
	    // Copy callback lists to prevent modification.
	    if (all = cache.all) all = all.slice()
	    if (list = cache[event]) list = list.slice()

	    // Execute event callbacks except one named "all"
	    if (event !== 'all') {
	      returned = triggerEvents(list, rest, this) && returned
	    }

	    // Execute "all" callbacks.
	    returned = triggerEvents(all, [event].concat(rest), this) && returned
	  }

	  return returned
	}

	Events.prototype.emit = Events.prototype.trigger
	Events.prototype.one = Events.prototype.once

	// Helpers
	// -------

	var keys = Object.keys

	if (!keys) {
	  keys = function(o) {
	    var result = []

	    for (var name in o) {
	      if (o.hasOwnProperty(name)) {
	        result.push(name)
	      }
	    }
	    return result
	  }
	}

	// Mix `Events` to object instance or Class function.
	Events.mixTo = function(receiver) {
	  receiver = isFunction(receiver) ? receiver.prototype : receiver
	  var proto = Events.prototype

	  var event = new Events
	  for (var key in proto) {
	    if (proto.hasOwnProperty(key)) {
	      copyProto(key)
	    }
	  }

	  function copyProto(key) {
	    receiver[key] = function() {
	      proto[key].apply(event, Array.prototype.slice.call(arguments))
	      return this
	    }
	  }
	}

	// Execute callbacks
	function triggerEvents(list, args, context) {
	  var pass = true

	  if (list) {
	    var i = 0, l = list.length, a1 = args[0], a2 = args[1], a3 = args[2]
	    // call is faster than apply, optimize less than 3 argu
	    // http://blog.csdn.net/zhengyinhui100/article/details/7837127
	    switch (args.length) {
	      case 0: for (; i < l; i += 2) {pass = list[i].call(list[i + 1] || context) !== false && pass} break;
	      case 1: for (; i < l; i += 2) {pass = list[i].call(list[i + 1] || context, a1) !== false && pass} break;
	      case 2: for (; i < l; i += 2) {pass = list[i].call(list[i + 1] || context, a1, a2) !== false && pass} break;
	      case 3: for (; i < l; i += 2) {pass = list[i].call(list[i + 1] || context, a1, a2, a3) !== false && pass} break;
	      default: for (; i < l; i += 2) {pass = list[i].apply(list[i + 1] || context, args) !== false && pass} break;
	    }
	  }
	  // trigger will return false if one of the callbacks return false
	  return pass;
	}

	function isFunction(func) {
	  return Object.prototype.toString.call(func) === '[object Function]'
	}

	Events.mixTo(module.exports)


/***/ },
/* 7 */
/***/ function(module, exports) {

	/**
	 * loader module
	 */

	var isFunction = isType("Function"),
	    noop = function() {},
	    head = document.head || document.getElementsByTagName('head')[0],
	    baseElement = head.getElementsByTagName("base")[0],
	    IS_CSS_RE = /\.css(?:\?|$)/i,
	    isOldWebKit = +navigator.userAgent
	      .replace(/.*(?:AppleWebKit|AndroidWebKit)\/?(\d+).*/i, "$1") < 536;

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

	    // ref: #185 & http://dev.jquery.com/ticket/2709
	    if (baseElement) {
	        head.insertBefore(node, baseElement);
	    } else {
	        head.appendChild(node);
	    }
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
	        node.onload = node.onerror = onload;
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
	    if (document.currentScript) {
	        return document.currentScript;
	    }

	    // For IE6-9 browsers, the script onload event may not fire right
	    // after the script is evaluated. Kris Zyp found that it
	    // could query the script nodes and the one that is in "interactive"
	    // mode indicates the current script
	    // ref: http://goo.gl/JHfFW

	    var scripts = document.scripts,
	        script,
	        length = scripts.length,
	        i = length - 1;

	    for (; i >= 0; i--) {
	        script = scripts[i];
	        if (script.readyState === "interactive") {
	            return script;
	        }
	    }

	    return scripts[length - 1];
	}

	function getScriptAbsoluteSrc(node) {
	    return node.hasAttribute ? // non-IE6/7
	        node.src :
	        // see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
	        node.getAttribute("src", 4);
	}

	var currentScript = getCurrentScript(),
	    rstaticUrl = /^.+?\/tbtx\//,
	    match = rstaticUrl.exec(getScriptAbsoluteSrc(currentScript));

	module.exports = {
	    staticUrl: match && match[0],

	    getCurrentScript: getCurrentScript,
	    request: request,
	    loadCss: request,
	    loadScript: request
	};

	function isType(type) {
	    return function(obj) {
	        return {}.toString.call(obj) == "[object " + type + "]";
	    }
	}

/***/ },
/* 8 */
/***/ function(module, exports) {

	/**
	 * support
	 */
	var ua = navigator.userAgent;

	// thanks modernizr
	var getElement = function(type) {
	        return document.createElement(type);
	    },

	    splitter = ' ',
	    supportElem = getElement('tbtx'),
	    canvasElem = getElement('canvas');
	    supportStyl = supportElem.style,

	    /**
	     * css 使用 -webkit-box-sizing
	     * dom使用boxSizing
	     */
	    // prefixes = ' -webkit- -moz- -o- -ms- '.split(splitter),
	    prefixes = 'Webkit Moz O ms',
	    cssPrefixes = prefixes.split(splitter),
	    // domPrefixes = prefixes.toLowerCase().split(splitter),

	    prefixed = function(prop) {
	        return testPropsAll(prop, 'pfx');
	    },
	    testProps = function(props, prefixed) {
	        var prop,
	            i;

	        for (i in props) {
	            prop = props[i];
	            if (supportStyl[prop] !== undefined) {
	                return prefixed === 'pfx' ? prop : true;
	            }
	        }
	        return false;
	    },
	    testPropsAll = function(prop, prefixed) {
	        var ucProp = ucfirst(prop),
	            props = (prop + splitter + cssPrefixes.join(ucProp + splitter) + ucProp).split(splitter);

	        return testProps(props, prefixed);
	    },

	    transform = prefixed('transform'),
	    transition = prefixed('transition'),

	    support = {
	        touch: 'ontouchstart' in document.documentElement,
	        pad: /iPad/.test(ua),
	        android: /Android/.test(ua),
	        ios: /iPhone|iPod|iPad/.test(ua),
	        // 移动终端，包含pad
	        mobile: /AppleWebKit.*Mobile.*/.test(ua),

	        canvas: !!(canvasElem.getContext && canvasElem.getContext('2d')),

	        transition: transition,
	        transform: transform,
	        translate3d: testPropsAll('perspective')
	    };

	support.phone = support.mobile && screen.width < 600;

	var transEndEventNames = {
	    WebkitTransition : 'webkitTransitionEnd',
	    MozTransition    : 'transitionend',
	    OTransition      : 'oTransitionEnd otransitionend',
	    transition       : 'transitionend'
	};
	support.transitionEnd = transition ? transEndEventNames[transition]: '';

	module.exports = {
	    support: support,
	    testPropsAll: testPropsAll,
	    prefixed: prefixed
	};

	function ucfirst(str) {
	    return str.charAt(0).toUpperCase() + str.substring(1);
	}

/***/ }
/******/ ]);