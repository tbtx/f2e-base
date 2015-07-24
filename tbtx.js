(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define(factory);
	else if(typeof exports === 'object')
		exports["tbtx"] = factory();
	else
		root["tbtx"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
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

	var lang = __webpack_require__(1),
	    extend = lang.extend;

	var modules = [
	    lang,
	    __webpack_require__(2)
	];

	modules.forEach(function(m) {
	    extend(exports, m);
	});

/***/ },
/* 1 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {var S = exports;

	/**
	* 语言扩展
	*/
	var class2type = {},

	    toString = class2type.toString,

	    hasOwn = class2type.hasOwnProperty,

	    hasOwnProperty = function(o, p) {
	        return hasOwn.call(o, p);
	    },

	    noop = function() {},

	    error = function (msg) {
	        throw isError(msg) ? msg : new Error(msg);
	    },

	    cidCounter = 0,

	    isSupportConsole = global.console && console.log,

	    // 切割字符串为一个个小块，以空格或逗号分开它们，结合replace实现字符串的forEach
	    rword = /[^, ]+/g,

	    // 是否是复杂类型
	    // rcomplexType = /^(?:object|array)$/,

	    // 删除标签
	    rtags = /<[^>]+>/img,

	    // 简单的模板替换
	    rsubstitute = /\\?\{\{\s*([^{}\s]+)\s*\}\}/mg;

	'Boolean Number String Function Array Date RegExp Object Error'.replace(rword, function(name, lc) {
	    class2type['[object ' + name + ']'] = (lc = name.toLowerCase());
	    S['is' + name] = function(o) {
	        return type(o) === lc;
	    };
	});

	var isArray = Array.isArray = S.isArray = Array.isArray || S.isArray,
	    isFunction = S.isFunction,
	    isObject = S.isObject,
	    isString = S.isString,
	    isError = S.isError,

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

	        if (lengthType !== 'number' || typeof o.nodeName === 'string' || isWindow(o) || oType === 'string' || oType === 'function' && !('item' in o && lengthType === 'number')) {
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
	        if (i === length) {
	            target = S;
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

	        if (!m) {
	            error('later: method undefined');
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
	                return a == String(b);
	            case 'number':
	                return ret;
	            case 'date':
	            case 'boolean':
	                return +a == +b;
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

	extend(S, {

	    noop: noop,
	    error: error,
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
	            msg = src + ": " + msg;
	        }
	        console.log(msg);

	        return this;
	    } : noop,

	    isWindow: isWindow,
	    isPlainObject: isPlainObject,
	    isEqual: isEqual,

	    uniqueCid: function() {
	        return cidCounter++;
	    },

	    ucfirst: function(str) {
	        return str.charAt(0).toUpperCase() + str.substring(1);
	    },

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
	                timer = later(fn, ms, 0, context, arguments);
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
	    }
	});


	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var each = __webpack_require__(1).each;

	var __config = {
	    debug: location.search.indexOf("debug") !== -1 ? true : false
	};

	module.exports = {

	    version: '3.0',

	    config: function(key, value) {
	        var ret = this;

	        if (typeof key == 'string') {
	            // get config
	            if (value === undefined) {
	                ret = __config[key];
	            } else { // set config
	                __config[key] = value;
	            }
	        } else {
	            // Object config
	            each(key, function(v, k) {
	                __config[k] = v;
	            });
	        }

	        return ret;
	    },

	    __data: {
	        config: __config
	    }
	};

/***/ }
/******/ ])
});
;