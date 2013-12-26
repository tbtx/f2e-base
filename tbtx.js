/*
 * tbtx-base-js
 * 2013-12-26 5:04:41
 * 十一_tbtx
 * zenxds@gmail.com
 */
(function(global, tbtx) {

    var cidCounter = 0;

    global[tbtx] = {

        /**
         * 在log环境下输出log信息，避免因为忘记删除log语句而引发错误
         * @param  {string} msg 消息
         * @param  {string} cat 类型，如error/info等，可选
         * @param  {string} src 消息来源，可选
         * @return {object}     返回tbtx以链式调用，如tbtx.log().log()
         */
        log: function(msg, cat, src) {
            if (src) {
                msg = src + ': ' + msg;
            }
            if (global['console'] !== undefined && console.log) {
                console[cat && console[cat] ? cat : 'log'](msg);
            }
            return this;
        },

        /*
         * debug mod off
         */
        debug: false,

        /**
         * staticUrl 默认静态文件url前缀
         * 会在后面根据实际的地址重写，这里作为备用
         * @type {String}
         */
        staticUrl: "http://static.tianxia.taobao.com/tbtx",

        /**
         * global对象，在浏览器环境中为window
         * @type {object}
         */
        global: global,

        _tbtx: global[tbtx],

        /**
         * 存放数据
         * @type {jQuery Object}
         */
        _data: jQuery({}),

        /**
         * 存取数据
         * @param  {string} key   键值
         * @param  {any} value 存放值
         */
        data: function() {
            return this._data.data.apply(this._data, arguments);
        },

        removeData: function() {
            return this._data.removeData.apply(this._data, arguments);
        },

        /**
         * 空函数，在需要使用空函数作为参数时使用
         */
        noop: function() {},

        /**
         * client unique id
         * @return {number} cid
         */
        uniqueCid: function() {
            return cidCounter++;
        }
    };

})(this, 'tbtx');


;(function(global, S, undefined) {
    // 语言扩展
    // 不依赖jQuery
    // 内部使用S，简化tbtx

    var AP = Array.prototype,
        OP = Object.prototype,
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

        filter = AP.filter ?
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

        map = AP.map ?
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

        namespace = function () {
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

        startsWith = function(str, prefix) {
            return str.lastIndexOf(prefix, 0) === 0;
        },

        endsWith = function(str, suffix) {
            var index = str.length - suffix.length;
            return index >= 0 && str.indexOf(suffix, index) == index;
        },

         /*
         * 返回m-n之间的随机数，并取整,
         * 包括m, 不包括n - floor, ceil相反
         * 也可以传入数组，随机返回数组某个元素
         */
        choice = function(m, n) {
            var array,
                random,
                tmp;
            if (isArray(m)) {
                array = m;
                m = 0;
                n = array.length;
            }

            if (m > n) {
                tmp = m;
                m = n;
                n = tmp;
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
            if (!isString(str)) {
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

        /**
         * query字符串转为对象
         */
        unparam = function(str, sep, eq) {
            if (!isString(str)) {
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

        /**
         * parse url
         * @param  {url}    url     the url to be parsed
         * @return {Object}         a object with url info
         */
        parseUrl = function(url) {
            url = url || location.href;
            var ret = {};
            if (!isString(url)) {
                return ret;
            }
            var match = URI_RE.exec(url);
            if (match) {
                return {
                    scheme: match[1],
                    credentials: match[2],
                    domain: match[3],
                    port: match[4],
                    path: match[5],
                    query: match[6],
                    fragment: match[7]
                };
            }

            return ret;
        },
        getFragment = function(url) {
            url = url || location.href;
            var match = URI_RE.exec(url);
            return match[7] || "";
        },
        getQueryParam = function(name, url) {
            if (S.isUri(name)) {
                url = name;
                name = "";
            }
            url = url || location.href;

            var match = URI_RE.exec(url),
                ret = unparam(match[6]);

            if (name) {
                return ret[name] || '';
            }
            return ret;
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

    var mix = S.mix = function(des, source, blacklist, over) {
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
                des[i] = source[i];
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

        /**
         * 判断deferred对象是否正在处理中
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
            if (isString(val)) {
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
        filter: filter,
        map: map,
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

        keys: keys,
        makeArray: makeArray,
        deepCopy: deepCopy,
        namespace: namespace,
        startsWith: startsWith,
        endsWith: endsWith,
        choice: choice,
        shuffle: shuffle,
        Class: Class,
        Now: Now,
        throttle: throttle,
        curry: curry,
        substitute: substitute,
        unparam: unparam,
        parseUrl: parseUrl,
        getFragment: getFragment,
        getQueryParam: getQueryParam,
        escapeHtml: escapeHtml,
        unEscapeHtml: unEscapeHtml
    });
})(this, tbtx, undefined);


;(function(exports) {
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
    if (!keys) {
        keys = function(o) {
            var result = [];
            for (var name in o) {
                if (o.hasOwnProperty(name)) {
                    result.push(name);
                }
            }
            return result;
        };
    }
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

    exports.Events = Events;
    Events.mixTo(exports);
})(tbtx);

;(function(S) {
    var exports = S.namespace("Aspect");

    exports.before = function(methodName, callback, context) {
        return weave.call(this, "before", methodName, callback, context);
    };
    // 在指定方法执行后，再执行 callback
    exports.after = function(methodName, callback, context) {
        return weave.call(this, "after", methodName, callback, context);
    };
    // Helpers
    // -------
    var eventSplitter = /\s+/;
    function weave(when, methodName, callback, context) {
        var names = methodName.split(eventSplitter);
        var name, method;
        while (name = names.shift()) {
            method = getMethod(this, name);
            if (!method.__isAspected) {
                wrap.call(this, name);
            }
            this.on(when + ":" + name, callback, context);
        }
        return this;
    }
    function getMethod(host, methodName) {
        var method = host[methodName];
        if (!method) {
            throw new Error("Invalid method name: " + methodName);
        }
        return method;
    }
    function wrap(methodName) {
        var old = this[methodName];
        this[methodName] = function() {
            var args = Array.prototype.slice.call(arguments);
            var beforeArgs = [ "before:" + methodName ].concat(args);
            // prevent if trigger return false
            if (this.trigger.apply(this, beforeArgs) === false) return;
            var ret = old.apply(this, arguments);
            var afterArgs = [ "after:" + methodName, ret ].concat(args);
            this.trigger.apply(this, afterArgs);
            return ret;
        };
        this[methodName].__isAspected = true;
    }
})(tbtx);

;(function(S) {
    var exports = S.namespace("Attrs");
    // set/get/initAttrs
    // change 手动触发change事件
    // set会触发 change:attrName 事件
    // 实例(一般是构造函数原型上)的propsInAttrs在initAttrs时会自动转成this的属性

    // Attribute
    // -----------------
    // Thanks to:
    //  - http://documentcloud.github.com/backbone/#Model
    //  - http://yuilibrary.com/yui/docs/api/classes/AttributeCore.html
    //  - https://github.com/berzniz/backbone.getters.setters
    // 负责 attributes 的初始化
    // attributes 是与实例相关的状态信息，可读可写，发生变化时，会自动触发相关事件
    exports.initAttrs = function(config) {
        // initAttrs 是在初始化时调用的，默认情况下实例上肯定没有 attrs，不存在覆盖问题
        var attrs = this.attrs = {};
        // Get all inherited attributes.
        var specialProps = this.propsInAttrs || [];
        mergeInheritedAttrs(attrs, this, specialProps);
        // Merge user-specific attributes from config.
        if (config) {
            mergeUserValue(attrs, config);
        }
        // 对于有 setter 的属性，要用初始值 set 一下，以保证关联属性也一同初始化
        setSetterAttrs(this, attrs, config);
        // Convert `on/before/afterXxx` config to event handler.
        parseEventsFromAttrs(this, attrs);
        // 将 this.attrs 上的 special properties 放回 this 上
        copySpecialProps(specialProps, this, attrs, true);
    };
    // Get the value of an attribute.
    exports.get = function(key) {
        var attr = this.attrs[key] || {};
        var val = attr.value;
        return attr.getter ? attr.getter.call(this, val, key) : val;
    };
    // Set a hash of model attributes on the object, firing `"change"` unless
    // you choose to silence it.
    exports.set = function(key, val, options) {
        var attrs = {};
        // set("key", val, options)
        if (isString(key)) {
            attrs[key] = val;
        } else {
            attrs = key;
            options = val;
        }
        options || (options = {});
        var silent = options.silent;
        var override = options.override;
        var now = this.attrs;
        var changed = this.__changedAttrs || (this.__changedAttrs = {});
        for (key in attrs) {
            if (!attrs.hasOwnProperty(key)) continue;
            var attr = now[key] || (now[key] = {});
            val = attrs[key];
            if (attr.readOnly) {
                throw new Error("This attribute is readOnly: " + key);
            }
            // invoke setter
            if (attr.setter) {
                val = attr.setter.call(this, val, key);
            }
            // 获取设置前的 prev 值
            var prev = this.get(key);
            // 获取需要设置的 val 值
            // 如果设置了 override 为 true，表示要强制覆盖，就不去 merge 了
            // 都为对象时，做 merge 操作，以保留 prev 上没有覆盖的值
            if (!override && isPlainObject(prev) && isPlainObject(val)) {
                val = merge(merge({}, prev), val);
            }
            // set finally
            now[key].value = val;
            // invoke change event
            // 初始化时对 set 的调用，不触发任何事件
            if (!this.__initializingAttrs && !isEqual(prev, val)) {
                if (silent) {
                    changed[key] = [ val, prev ];
                } else {
                    this.trigger("change:" + key, val, prev, key);
                }
            }
        }
        return this;
    };
    // Call this method to manually fire a `"change"` event for triggering
    // a `"change:attribute"` event for each changed attribute.
    exports.change = function() {
        var changed = this.__changedAttrs;
        if (changed) {
            for (var key in changed) {
                if (changed.hasOwnProperty(key)) {
                    var args = changed[key];
                    this.trigger("change:" + key, args[0], args[1], key);
                }
            }
            delete this.__changedAttrs;
        }
        return this;
    };
    // for test
    exports._isPlainObject = isPlainObject;
    // Helpers
    // -------
    var toString = Object.prototype.toString;
    var hasOwn = Object.prototype.hasOwnProperty;
    /**
   * Detect the JScript [[DontEnum]] bug:
   * In IE < 9 an objects own properties, shadowing non-enumerable ones, are
   * made non-enumerable as well.
   * https://github.com/bestiejs/lodash/blob/7520066fc916e205ef84cb97fbfe630d7c154158/lodash.js#L134-L144
   */
    /** Detect if own properties are iterated after inherited properties (IE < 9) */
    var iteratesOwnLast;
    (function() {
        var props = [];
        function Ctor() {
            this.x = 1;
        }
        Ctor.prototype = {
            valueOf: 1,
            y: 1
        };
        for (var prop in new Ctor()) {
            props.push(prop);
        }
        iteratesOwnLast = props[0] !== "x";
    })();
    var isArray = Array.isArray || function(val) {
        return toString.call(val) === "[object Array]";
    };
    function isString(val) {
        return toString.call(val) === "[object String]";
    }
    function isFunction(val) {
        return toString.call(val) === "[object Function]";
    }
    function isWindow(o) {
        return o != null && o == o.window;
    }
    function isPlainObject(o) {
        // Must be an Object.
        // Because of IE, we also have to check the presence of the constructor
        // property. Make sure that DOM nodes and window objects don't
        // pass through, as well
        if (!o || toString.call(o) !== "[object Object]" || o.nodeType || isWindow(o)) {
            return false;
        }
        try {
            // Not own constructor property must be Object
            if (o.constructor && !hasOwn.call(o, "constructor") && !hasOwn.call(o.constructor.prototype, "isPrototypeOf")) {
                return false;
            }
        } catch (e) {
            // IE8,9 Will throw exceptions on certain host objects #9897
            return false;
        }
        var key;
        // Support: IE<9
        // Handle iteration over inherited properties before own properties.
        // http://bugs.jquery.com/ticket/12199
        if (iteratesOwnLast) {
            for (key in o) {
                return hasOwn.call(o, key);
            }
        }
        // Own properties are enumerated firstly, so to speed up,
        // if last one is own, then all properties are own.
        for (key in o) {}
        return key === undefined || hasOwn.call(o, key);
    }
    function isEmptyObject(o) {
        if (!o || toString.call(o) !== "[object Object]" || o.nodeType || isWindow(o) || !o.hasOwnProperty) {
            return false;
        }
        for (var p in o) {
            if (o.hasOwnProperty(p)) return false;
        }
        return true;
    }
    function merge(receiver, supplier) {
        var key, value;
        for (key in supplier) {
            if (supplier.hasOwnProperty(key)) {
                value = supplier[key];
                // 只 clone 数组和 plain object，其他的保持不变
                if (isArray(value)) {
                    value = value.slice();
                } else if (isPlainObject(value)) {
                    var prev = receiver[key];
                    isPlainObject(prev) || (prev = {});
                    value = merge(prev, value);
                }
                receiver[key] = value;
            }
        }
        return receiver;
    }
    var keys = Object.keys;
    if (!keys) {
        keys = function(o) {
            var result = [];
            for (var name in o) {
                if (o.hasOwnProperty(name)) {
                    result.push(name);
                }
            }
            return result;
        };
    }
    function mergeInheritedAttrs(attrs, instance, specialProps) {
        var inherited = [];
        var proto = instance.constructor.prototype;
        while (proto) {
            // 不要拿到 prototype 上的
            if (!proto.hasOwnProperty("attrs")) {
                proto.attrs = {};
            }
            // 将 proto 上的特殊 properties 放到 proto.attrs 上，以便合并
            copySpecialProps(specialProps, proto.attrs, proto);
            // 为空时不添加
            if (!isEmptyObject(proto.attrs)) {
                inherited.unshift(proto.attrs);
            }
            // 向上回溯一级
            proto = proto.constructor.superclass;
        }
        // Merge and clone default values to instance.
        for (var i = 0, len = inherited.length; i < len; i++) {
            merge(attrs, normalize(inherited[i]));
        }
    }
    function mergeUserValue(attrs, config) {
        merge(attrs, normalize(config, true));
    }
    function copySpecialProps(specialProps, receiver, supplier, isAttr2Prop) {
        for (var i = 0, len = specialProps.length; i < len; i++) {
            var key = specialProps[i];
            if (supplier.hasOwnProperty(key)) {
                receiver[key] = isAttr2Prop ? receiver.get(key) : supplier[key];
            }
        }
    }
    var EVENT_PATTERN = /^(on|before|after)([A-Z].*)$/;
    var EVENT_NAME_PATTERN = /^(Change)?([A-Z])(.*)/;
    function parseEventsFromAttrs(host, attrs) {
        for (var key in attrs) {
            if (attrs.hasOwnProperty(key)) {
                var value = attrs[key].value, m;
                if (isFunction(value) && (m = key.match(EVENT_PATTERN))) {
                    host[m[1]](getEventName(m[2]), value);
                    delete attrs[key];
                }
            }
        }
    }
    // Converts `Show` to `show` and `ChangeTitle` to `change:title`
    function getEventName(name) {
        var m = name.match(EVENT_NAME_PATTERN);
        var ret = m[1] ? "change:" : "";
        ret += m[2].toLowerCase() + m[3];
        return ret;
    }
    function setSetterAttrs(host, attrs, config) {
        var options = {
            silent: true
        };
        host.__initializingAttrs = true;
        for (var key in config) {
            if (config.hasOwnProperty(key)) {
                if (attrs[key].setter) {
                    host.set(key, config[key], options);
                }
            }
        }
        delete host.__initializingAttrs;
    }
    var ATTR_SPECIAL_KEYS = [ "value", "getter", "setter", "readOnly" ];
    // normalize `attrs` to
    //
    //   {
    //      value: 'xx',
    //      getter: fn,
    //      setter: fn,
    //      readOnly: boolean
    //   }
    //
    function normalize(attrs, isUserValue) {
        var newAttrs = {};
        for (var key in attrs) {
            var attr = attrs[key];
            if (!isUserValue && isPlainObject(attr) && hasOwnProperties(attr, ATTR_SPECIAL_KEYS)) {
                newAttrs[key] = attr;
                continue;
            }
            newAttrs[key] = {
                value: attr
            };
        }
        return newAttrs;
    }
    function hasOwnProperties(object, properties) {
        for (var i = 0, len = properties.length; i < len; i++) {
            if (object.hasOwnProperty(properties[i])) {
                return true;
            }
        }
        return false;
    }
    // 对于 attrs 的 value 来说，以下值都认为是空值： null, undefined, '', [], {}
    function isEmptyAttrValue(o) {
        return o == null || // null, undefined
        (isString(o) || isArray(o)) && o.length === 0 || // '', []
        isEmptyObject(o);
    }
    // 判断属性值 a 和 b 是否相等，注意仅适用于属性值的判断，非普适的 === 或 == 判断。
    function isEqual(a, b) {
        if (a === b) return true;
        if (isEmptyAttrValue(a) && isEmptyAttrValue(b)) return true;
        // Compare `[[Class]]` names.
        var className = toString.call(a);
        if (className != toString.call(b)) return false;
        switch (className) {
          // Strings, numbers, dates, and booleans are compared by value.
            case "[object String]":
            // Primitives and their corresponding object wrappers are
            // equivalent; thus, `"5"` is equivalent to `new String("5")`.
            return a == String(b);

          case "[object Number]":
            // `NaN`s are equivalent, but non-reflexive. An `equal`
            // comparison is performed for other numeric values.
            return a != +a ? b != +b : a == 0 ? 1 / a == 1 / b : a == +b;

          case "[object Date]":
          case "[object Boolean]":
            // Coerce dates and booleans to numeric primitive values.
            // Dates are compared by their millisecond representations.
            // Note that invalid dates with millisecond representations
            // of `NaN` are not equivalent.
            return +a == +b;

          // RegExps are compared by their source patterns and flags.
            case "[object RegExp]":
            return a.source == b.source && a.global == b.global && a.multiline == b.multiline && a.ignoreCase == b.ignoreCase;

          // 简单判断数组包含的 primitive 值是否相等
            case "[object Array]":
            var aString = a.toString();
            var bString = b.toString();
            // 只要包含非 primitive 值，为了稳妥起见，都返回 false
            return aString.indexOf("[object") === -1 && bString.indexOf("[object") === -1 && aString === bString;
        }
        if (typeof a != "object" || typeof b != "object") return false;
        // 简单判断两个对象是否相等，只判断第一层
        if (isPlainObject(a) && isPlainObject(b)) {
            // 键值不相等，立刻返回 false
            if (!isEqual(keys(a), keys(b))) {
                return false;
            }
            // 键相同，但有值不等，立刻返回 false
            for (var p in a) {
                if (a[p] !== b[p]) return false;
            }
            return true;
        }
        // 其他情况返回 false, 以避免误判导致 change 事件没发生
        return false;
    }
})(tbtx);

;(function($, S) {
    var Class = S.Class,
        Events = S.Events,
        Aspect = S.Aspect,
        Attrs = S.Attrs;

    // Base
    // _onChange属性名 会自动监听attr变化
    // 在attrs里面设置是没有_开头的
    // config直接就是attrs对象的 {element: ""}
    var Base = new Class();
    Base.Implements([Events, Aspect, Attrs]);
    Base.include({
        init: function(config) {
            this.initAttrs(config);
            parseEventsFromInstance(this, this.attrs);
        },
        destroy: function() {
            // 解除事件绑定
            this.off();

            for (var p in this) {
                if (this.hasOwnProperty(p)) {
                    delete this[p];
                }
            }
            // Destroy should be called only once, generate a fake destroy after called
            // https://github.com/aralejs/widget/issues/50
            this.destroy = function() {};
        }
    });
    function parseEventsFromInstance(host, attrs) {
        for (var attr in attrs) {
            if (attrs.hasOwnProperty(attr)) {
                var m = "_onChange" + ucfirst(attr);
                if (host[m]) {
                    host.on("change:" + attr, host[m]);
                }
            }
        }
    }


    // 所有初始化过的 Widget 实例
    var cachedInstances = {};
    var DELEGATE_EVENT_NS = ".delegate-events-";
    var ON_RENDER = "_onRender";
    var DATA_WIDGET_CID = "data-widget-cid";

    var Widget = new Class(Base);

    Widget.DEFAULT_PARENT_NODE = "body";

    Widget.include({
        propsInAttrs: ["initElement", "element", "events"],

        element: null,

        // 事件代理，格式为：
        //   {
        //     'mousedown .title': 'edit',
        //     'click {{attrs.saveButton}}': 'save'
        //     'click .open': function(ev) { ... }
        //   }
        events: null,

         // 属性列表
        attrs: {
            // 基本属性
            id: null,
            className: null,
            style: null,
            // 默认模板
            template: "<div></div>",
            // 默认数据模型
            model: null,
            // 组件的默认父节点
            // document.body在脚本放在头部时无法访问
            parentNode: Widget.DEFAULT_PARENT_NODE,

            renderMethod: "appendTo"
        },

        init: function(config) {
            this.cid = uniqueCid();

            Widget.superclass.init.call(this, config);

             // 初始化 props
            this.parseElement();
            this.initProps();
            // 初始化 events
            this.delegateEvents();

            // 提供给子类覆盖
            this.setup();

            // 保存实例信息
            this._stamp();
            // 是否由 template 初始化
            this._isTemplate = !(config && config.element);
        },

        // 构建 this.element
        parseElement: function() {
            var element = this.element;
            if (element) {
                this.element = $(element);
            } else if (this.get("template")) {
                this.parseElementFromTemplate();
            }
            // 如果对应的 DOM 元素不存在，则报错
            if (!this.element || !this.element[0]) {
                throw new Error("element is invalid");
            }
        },
         // 从模板中构建 this.element
        parseElementFromTemplate: function() {
            var t, template = this.get("template");
            if (/^#/.test(template) && (t = document.getElementById(template.substring(1)))) {
                template = t.innerHTML;
                this.set("template", template);
            }
            this.element = $(template);
        },
        // 负责 properties 的初始化，提供给子类覆盖
        initProps: function() {},

        delegateEvents: function(element, events, handler) {
             // widget.delegateEvents()
            if (arguments.length === 0) {
                events = getEvents(this);
                element = this.element;
            } else if (arguments.length === 1) {
                events = element;
                element = this.element;
            } else if (arguments.length === 2) {
                handler = events;
                events = element;
                element = this.element;
            } else {
                element || (element = this.element);
                this._delegateElements || (this._delegateElements = []);
                this._delegateElements.push($(element));
            }
            // 'click p' => {'click p': handler}
            if (isString(events) && isFunction(handler)) {
                var o = {};
                o[events] = handler;
                events = o;
            }
            // key 为 'event selector'
            for (var key in events) {
                if (!events.hasOwnProperty(key)) continue;
                var args = parseEventKey(key, this);
                var eventType = args.type;
                var selector = args.selector;
                (function(handler, widget) {
                    var callback = function(ev) {
                        if (isFunction(handler)) {
                            handler.call(widget, ev);
                        } else {
                            widget[handler](ev);
                        }
                    };
                    // delegate
                    if (selector) {
                        $(element).on(eventType, selector, callback);
                    } else {
                        $(element).on(eventType, callback);
                    }
                })(events[key], this);
            }
            return this;
        },

        // 卸载事件代理
        undelegateEvents: function(element, eventKey) {
            if (!eventKey) {
                eventKey = element;
                element = null;
            }
            // 卸载所有
            // .undelegateEvents()
            if (arguments.length === 0) {
                var type = DELEGATE_EVENT_NS + this.cid;
                this.element && this.element.off(type);
                // 卸载所有外部传入的 element
                if (this._delegateElements) {
                    for (var de in this._delegateElements) {
                        if (!this._delegateElements.hasOwnProperty(de)) continue;
                        this._delegateElements[de].off(type);
                    }
                }
            } else {
                var args = parseEventKey(eventKey, this);
                // 卸载 this.element
                // .undelegateEvents(events)
                if (!element) {
                    this.element && this.element.off(args.type, args.selector);
                } else {
                    $(element).off(args.type, args.selector);
                }
            }
            return this;
        },

        $: function(selector) {
            return this.element.find(selector);
        },
        setup: function() {},

        // 将 widget 渲染到页面上
        // 渲染不仅仅包括插入到 DOM 树中，还包括样式渲染等
        // 约定：子类覆盖时，需保持 `return this`
        render: function() {
            // 让渲染相关属性的初始值生效，并绑定到 change 事件
            if (!this.rendered) {
                this._renderAndBindAttrs();
                this.rendered = true;
            }
            // 插入到文档流中
            var parentNode = this.get("parentNode"),
                relatedNode = this.get("relatedNode"),
                targetNode = relatedNode || parentNode,
                renderMethod = this.get("renderMethod");
            if (targetNode && !isInDocument(this.element[0])) {
                // 隔离样式，添加统一的命名空间
                // https://github.com/aliceui/aliceui.org/issues/9
                var outerBoxClass = this.constructor.outerBoxClass;
                if (outerBoxClass) {
                    var outerBox = this._outerBox = $("<div></div>").addClass(outerBoxClass);
                    outerBox.append(this.element)[renderMethod](targetNode);
                } else {
                    this.element[renderMethod](targetNode);
                }
            }
            return this;
        },
        // 让属性的初始值生效，并绑定到 change:attr 事件上
        _renderAndBindAttrs: function() {
            var widget = this;
            var attrs = widget.attrs;
            for (var attr in attrs) {
                if (!attrs.hasOwnProperty(attr)) continue;
                var m = ON_RENDER + ucfirst(attr);
                if (this[m]) {
                    var val = this.get(attr);
                    // 让属性的初始值生效。注：默认空值不触发
                    if (!isEmptyAttrValue(val)) {
                        this[m](val, undefined, attr);
                    }
                    // 将 _onRenderXx 自动绑定到 change:xx 事件上
                    (function(m) {
                        widget.on("change:" + attr, function(val, prev, key) {
                            widget[m](val, prev, key);
                        });
                    })(m);
                }
            }
        },
        _onRenderId: function(val) {
            this.element.attr("id", val);
        },
        _onRenderClassName: function(val) {
            this.element.addClass(val);
        },
        _onRenderStyle: function(val) {
            this.element.css(val);
        },
        // 让 element 与 Widget 实例建立关联
        _stamp: function() {
            var cid = this.cid;
            (this.initElement || this.element).attr(DATA_WIDGET_CID, cid);
            cachedInstances[cid] = this;
        },

        destroy: function() {
            this.undelegateEvents();
            delete cachedInstances[this.cid];
            // For memory leak
            if (this.element && this._isTemplate) {
                this.element.off();
                // 如果是 widget 生成的 element 则去除
                if (this._outerBox) {
                    this._outerBox.remove();
                } else {
                    this.element.remove();
                }
            }
            this.element = null;
            Widget.superclass.destroy.call(this);
        }
    });

    // For memory leak
    $(window).unload(function() {
        for (var cid in cachedInstances) {
            cachedInstances[cid].destroy();
        }
    });

    // 查询与 selector 匹配的第一个 DOM 节点，得到与该 DOM 节点相关联的 Widget 实例
    Widget.query = function(selector) {
        var element = $(selector).eq(0);
        var cid;
        element && (cid = element.attr(DATA_WIDGET_CID));
        return cachedInstances[cid];
    };

    var cidCounter = 0;
    function uniqueCid() {
        return "widget-" + cidCounter++;
    }

    var toString = Object.prototype.toString;
    function isString(val) {
        return toString.call(val) === "[object String]";
    }
    function isFunction(val) {
        return toString.call(val) === "[object Function]";
    }
     // Zepto 上没有 contains 方法
    var contains = $.contains || function(a, b) {
        //noinspection JSBitwiseOperatorUsage
        return !!(a.compareDocumentPosition(b) & 16);
    };
    function isInDocument(element) {
        return contains(document.documentElement, element);
    }
    function ucfirst(str) {
        return str.charAt(0).toUpperCase() + str.substring(1);
    }

    function getEvents(widget) {
        if (isFunction(widget.events)) {
            widget.events = widget.events();
        }
        return widget.events;
    }

    var EVENT_KEY_SPLITTER = /^(\S+)\s*(.*)$/;
    function parseEventKey(eventKey, widget) {
        var match = eventKey.match(EVENT_KEY_SPLITTER);
        var eventType = match[1] + DELEGATE_EVENT_NS + widget.cid;
        // 当没有 selector 时，需要设置为 undefined，以使得 zepto 能正确转换为 bind
        var selector = match[2] || undefined;
        if (selector && selector.indexOf("{{") > -1) {
            selector = parseExpressionInEventKey(selector, widget);
        }
        return {
            type: eventType,
            selector: selector
        };
    }

    var EXPRESSION_FLAG = /{{([^}]+)}}/g;
    var INVALID_SELECTOR = "INVALID_SELECTOR";
    // 解析 eventKey 中的 {{xx}}, {{yy}}
    function parseExpressionInEventKey(selector, widget) {
        return selector.replace(EXPRESSION_FLAG, function(m, name) {
            var parts = name.split(".");
            var point = widget, part;
            while (part = parts.shift()) {
                if (point === widget.attrs) {
                    point = widget.get(part);
                } else {
                    point = point[part];
                }
            }
            // 已经是 className，比如来自 dataset 的
            if (isString(point)) {
                return point;
            }
            // 不能识别的，返回无效标识
            return INVALID_SELECTOR;
        });
    }
    // 对于 attrs 的 value 来说，以下值都认为是空值： null, undefined
    function isEmptyAttrValue(o) {
        return o == null || o === undefined;
    }

    S.Base = Base;
    S.Widget = Widget;
})(jQuery, tbtx);

;(function(exports) {
    var toString = Object.prototype.toString,

        isString = function(val) {
            return toString.call(val) === '[object String]';
        },

        isNotEmptyString = function(val) {
            return isString(val) && val !== '';
        };

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

    exports.cookie = cookie;
})(tbtx);


;(function(exports) {

    function isType(type) {
        return function(obj) {
            return {}.toString.call(obj) == "[object " + type + "]";
        };
    }
    var isDate = isType("Date");

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
        format = format || "Y-m-d h:i:s";

        var o = normalizeDate(date),
            i;

        var ret = format;
        for (i in o) {
            ret = ret.replace(i, o[i]);
        }
        return ret;
    }

    // date转对象
    function normalizeDate(date) {
        date = toDate(date);

        var o = {
            Y: date.getFullYear(),
            M: date.getMonth() + 1,
            D: date.getDate(),
            H: date.getHours(),
            I: date.getMinutes(),
            S: date.getSeconds()
        };
        var ret = {},
            i;
        // for in o的时候如果再对o赋值，在IE7下有bug
        for(i in o) {
            ret[i] = o[i];
        }

        // 补0
        var key;
        for(i in o) {
            key = i.toLowerCase();
            if (key == 'y') {
                ret[key] = o[i].toString().substring(2, 4);
            } else {
                ret[key] = o[i] < 10 ? ("0" + o[i]) : o[i];
            }
        }

        return ret;
    }

    var SECONDS_OF_DAY = 24 * 60 * 60;
    function ago(v1, v2) {
        v1 = toDate(v1);
        v2 = toDate(v2);

        var tmp;
        // 保证v1 > v2
        if (v1 < v2) {
            tmp = v1;
            v1 = v2;
            v2 = tmp;
        }

        // diff 秒
        var floor = Math.floor,
            diff = (v1.getTime() - v2.getTime()) / 1000,
            dayDiff = floor(diff / SECONDS_OF_DAY),
            // 月份跟年粗略计算
            monthDiff = floor(dayDiff / 30),
            yearDiff = floor(dayDiff / 365);

        if (yearDiff) {
            return yearDiff + "年前";
        }
        if (monthDiff) {
            return monthDiff + "个月前";
        }
        if (dayDiff) {
            return dayDiff == 1 ? "昨天": dayDiff + "天前";
        }

        return diff < 60 && "刚刚" ||
            diff < 3600 && floor(diff / 60) + "分钟前" ||
            diff < SECONDS_OF_DAY && floor(diff / 3600) + "小时前";
    }

    // 字符串/数字 -> Date
    function toDate(date) {
        if (isDate(date)) {
            return date;
        }
        var type = typeof date;
        if (type == 'number' || type == 'string') {
            return new Date(date);
        } else{
            return new Date();
        }
    }

    function mixTo(r, s) {
        var p;
        for (p in s) {
            if (s.hasOwnProperty(p)) {
                r[p] = s[p];
            }
        }
    }

    mixTo(exports, {
        normalizeDate: normalizeDate,
        ago: ago,
        formatDate: formatDate
    });
})(tbtx);


;(function(exports) {
    /*
     * aralejs detector
     * detector.browser.name
     * !!detector.browser.ie
     * detector.browser.ie && detector.browser.version < 8
     */

    var detector = {};
    var NA_VERSION = "-1";
    var userAgent = navigator.userAgent || "";
    //var platform = navigator.platform || "";
    var appVersion = navigator.appVersion || "";
    var vendor = navigator.vendor || "";
    var external = window.external;
    var re_msie = /\b(?:msie |ie |trident\/[0-9].*rv[ :])([0-9.]+)/;

    function toString(object) {
        return Object.prototype.toString.call(object);
    }

    function isObject(object) {
        return toString(object) === "[object Object]";
    }

    function isFunction(object) {
        return toString(object) === "[object Function]";
    }

    function each(object, factory, argument) {
        for (var i = 0, b, l = object.length; i < l; i++) {
            if (factory.call(object, object[i], i) === false) {
                break;
            }
        }
    }
    // 硬件设备信息识别表达式。
    // 使用数组可以按优先级排序。
    var DEVICES = [
        ["nokia",
            function(ua) {
                // 不能将两个表达式合并，因为可能出现 "nokia; nokia 960"
                // 这种情况下会优先识别出 nokia/-1
                if (ua.indexOf("nokia ") !== -1) {
                    return /\bnokia ([0-9]+)?/;
                } else if (ua.indexOf("noain") !== -1) {
                    return /\bnoain ([a-z0-9]+)/;
                } else {
                    return /\bnokia([a-z0-9]+)?/;
                }
            }
        ], // 三星有 Android 和 WP 设备。
        ["samsung",
            function(ua) {
                if (ua.indexOf("samsung") !== -1) {
                    return /\bsamsung(?:\-gt)?[ \-]([a-z0-9\-]+)/;
                } else {
                    return /\b(?:gt|sch)[ \-]([a-z0-9\-]+)/;
                }
            }
        ],
        ["wp",
            function(ua) {
                return ua.indexOf("windows phone ") !== -1 || ua.indexOf("xblwp") !== -1 || ua.indexOf("zunewp") !== -1 || ua.indexOf("windows ce") !== -1;
            }
        ],
        ["pc", "windows"],
        ["ipad", "ipad"], // ipod 规则应置于 iphone 之前。
        ["ipod", "ipod"],
        ["iphone", /\biphone\b|\biph(\d)/],
        ["mac", "macintosh"],
        ["mi", /\bmi[ \-]?([a-z0-9 ]+(?= build))/],
        ["aliyun", /\baliyunos\b(?:[\-](\d+))?/],
        ["meizu", /\b(?:meizu\/|m)([0-9]+)\b/],
        ["nexus", /\bnexus ([0-9s.]+)/],
        ["huawei",
            function(ua) {
                if (ua.indexOf("huawei-huawei") !== -1) {
                    return /\bhuawei\-huawei\-([a-z0-9\-]+)/;
                } else {
                    return /\bhuawei[ _\-]?([a-z0-9]+)/;
                }
            }
        ],
        ["lenovo",
            function(ua) {
                if (ua.indexOf("lenovo-lenovo") !== -1) {
                    return /\blenovo\-lenovo[ \-]([a-z0-9]+)/;
                } else {
                    return /\blenovo[ \-]?([a-z0-9]+)/;
                }
            }
        ], // 中兴
        ["zte",
            function(ua) {
                if (/\bzte\-[tu]/.test(ua)) {
                    return /\bzte-[tu][ _\-]?([a-su-z0-9\+]+)/;
                } else {
                    return /\bzte[ _\-]?([a-su-z0-9\+]+)/;
                }
            }
        ], // 步步高
        ["vivo", /\bvivo ([a-z0-9]+)/],
        ["htc",
            function(ua) {
                if (/\bhtc[a-z0-9 _\-]+(?= build\b)/.test(ua)) {
                    return /\bhtc[ _\-]?([a-z0-9 ]+(?= build))/;
                } else {
                    return /\bhtc[ _\-]?([a-z0-9 ]+)/;
                }
            }
        ],
        ["oppo", /\boppo[_]([a-z0-9]+)/],
        ["konka", /\bkonka[_\-]([a-z0-9]+)/],
        ["sonyericsson", /\bmt([a-z0-9]+)/],
        ["coolpad", /\bcoolpad[_ ]?([a-z0-9]+)/],
        ["lg", /\blg[\-]([a-z0-9]+)/],
        ["android", "android"],
        ["blackberry", "blackberry"]
    ];
    // 操作系统信息识别表达式
    var OS = [
        ["wp",
            function(ua) {
                if (ua.indexOf("windows phone ") !== -1) {
                    return /\bwindows phone (?:os )?([0-9.]+)/;
                } else if (ua.indexOf("xblwp") !== -1) {
                    return /\bxblwp([0-9.]+)/;
                } else if (ua.indexOf("zunewp") !== -1) {
                    return /\bzunewp([0-9.]+)/;
                }
                return "windows phone";
            }
        ],
        ["windows", /\bwindows nt ([0-9.]+)/],
        ["macosx", /\bmac os x ([0-9._]+)/],
        ["ios",
            function(ua) {
                if (/\bcpu(?: iphone)? os /.test(ua)) {
                    return /\bcpu(?: iphone)? os ([0-9._]+)/;
                } else if (ua.indexOf("iph os ") !== -1) {
                    return /\biph os ([0-9_]+)/;
                } else {
                    return /\bios\b/;
                }
            }
        ],
        ["yunos", /\baliyunos ([0-9.]+)/],
        ["android", /\bandroid[\/\- ]?([0-9.x]+)?/],
        ["chromeos", /\bcros i686 ([0-9.]+)/],
        ["linux", "linux"],
        ["windowsce", /\bwindows ce(?: ([0-9.]+))?/],
        ["symbian", /\bsymbian(?:os)?\/([0-9.]+)/],
        ["meego", /\bmeego\b/],
        ["blackberry", "blackberry"]
    ];
    /*
     * 解析使用 Trident 内核的浏览器的 `浏览器模式` 和 `文档模式` 信息。
     * @param {String} ua, userAgent string.
     * @return {Object}
     */

    function IEMode(ua) {
        if (!re_msie.test(ua)) {
            return null;
        }
        var m, engineMode, engineVersion, browserMode, browserVersion, compatible = false;
        // IE8 及其以上提供有 Trident 信息，
        // 默认的兼容模式，UA 中 Trident 版本不发生变化。
        if (ua.indexOf("trident/") !== -1) {
            m = /\btrident\/([0-9.]+)/.exec(ua);
            if (m && m.length >= 2) {
                // 真实引擎版本。
                engineVersion = m[1];
                var v_version = m[1].split(".");
                v_version[0] = parseInt(v_version[0], 10) + 4;
                browserVersion = v_version.join(".");
            }
        }
        m = re_msie.exec(ua);
        browserMode = m[1];
        var v_mode = m[1].split(".");
        if ("undefined" === typeof browserVersion) {
            browserVersion = browserMode;
        }
        v_mode[0] = parseInt(v_mode[0], 10) - 4;
        engineMode = v_mode.join(".");
        if ("undefined" === typeof engineVersion) {
            engineVersion = engineMode;
        }
        return {
            browserVersion: browserVersion,
            browserMode: browserMode,
            engineVersion: engineVersion,
            engineMode: engineMode,
            compatible: engineVersion !== engineMode
        };
    }
    /**
     * 针对同源的 TheWorld 和 360 的 external 对象进行检测。
     * @param {String} key, 关键字，用于检测浏览器的安装路径中出现的关键字。
     * @return {Undefined,Boolean,Object} 返回 undefined 或 false 表示检测未命中。
     */

    function checkTW360External(key) {
        if (!external) {
            return;
        }
        // return undefined.
        try {
            //        360安装路径：
            //        C:%5CPROGRA~1%5C360%5C360se3%5C360SE.exe
            var runpath = external.twGetRunPath.toLowerCase();
            // 360SE 3.x ~ 5.x support.
            // 暴露的 external.twGetVersion 和 external.twGetSecurityID 均为 undefined。
            // 因此只能用 try/catch 而无法使用特性判断。
            var security = external.twGetSecurityID(window);
            var version = external.twGetVersion(security);
            if (runpath && runpath.indexOf(key) === -1) {
                return false;
            }
            if (version) {
                return {
                    version: version
                };
            }
        } catch (ex) {}
    }
    var ENGINE = [
        ["trident", re_msie], //["blink", /blink\/([0-9.+]+)/],
        ["webkit", /\bapplewebkit[\/]?([0-9.+]+)/],
        ["gecko", /\bgecko\/(\d+)/],
        ["presto", /\bpresto\/([0-9.]+)/],
        ["androidwebkit", /\bandroidwebkit\/([0-9.]+)/],
        ["coolpadwebkit", /\bcoolpadwebkit\/([0-9.]+)/]
    ];
    var BROWSER = [ // Sogou.
        ["sg", / se ([0-9.x]+)/], // TheWorld (世界之窗)
        // 由于裙带关系，TW API 与 360 高度重合。
        // 只能通过 UA 和程序安装路径中的应用程序名来区分。
        // TheWorld 的 UA 比 360 更靠谱，所有将 TheWorld 的规则放置到 360 之前。
        ["tw",
            function(ua) {
                var x = checkTW360External("theworld");
                if (typeof x !== "undefined") {
                    return x;
                }
                return "theworld";
            }
        ], // 360SE, 360EE.
        ["360",
            function(ua) {
                var x = checkTW360External("360se");
                if (typeof x !== "undefined") {
                    return x;
                }
                if (ua.indexOf("360 aphone browser") !== -1) {
                    return /\b360 aphone browser \(([^\)]+)\)/;
                }
                return /\b360(?:se|ee|chrome|browser)\b/;
            }
        ], // Maxthon
        ["mx",
            function(ua) {
                try {
                    if (external && (external.mxVersion || external.max_version)) {
                        return {
                            version: external.mxVersion || external.max_version
                        };
                    }
                } catch (ex) {}
                return /\bmaxthon(?:[ \/]([0-9.]+))?/;
            }
        ],
        ["qq", /\bm?qqbrowser\/([0-9.]+)/],
        ["green", "greenbrowser"],
        ["tt", /\btencenttraveler ([0-9.]+)/],
        ["lb",
            function(ua) {
                if (ua.indexOf("lbbrowser") === -1) {
                    return false;
                }
                var version;
                try {
                    if (external && external.LiebaoGetVersion) {
                        version = external.LiebaoGetVersion();
                    }
                } catch (ex) {}
                return {
                    version: version || NA_VERSION
                };
            }
        ],
        ["tao", /\btaobrowser\/([0-9.]+)/],
        ["fs", /\bcoolnovo\/([0-9.]+)/],
        ["sy", "saayaa"], // 有基于 Chromniun 的急速模式和基于 IE 的兼容模式。必须在 IE 的规则之前。
        ["baidu", /\bbidubrowser[ \/]([0-9.x]+)/], // 后面会做修复版本号，这里只要能识别是 IE 即可。
        ["ie", re_msie],
        ["mi", /\bmiuibrowser\/([0-9.]+)/], // Opera 15 之后开始使用 Chromniun 内核，需要放在 Chrome 的规则之前。
        ["opera",
            function(ua) {
                var re_opera_old = /\bopera.+version\/([0-9.ab]+)/;
                var re_opera_new = /\bopr\/([0-9.]+)/;
                return re_opera_old.test(ua) ? re_opera_old : re_opera_new;
            }
        ],
        ["chrome", / (?:chrome|crios|crmo)\/([0-9.]+)/], // UC 浏览器，可能会被识别为 Android 浏览器，规则需要前置。
        ["uc",
            function(ua) {
                if (ua.indexOf("ucbrowser/") >= 0) {
                    return /\bucbrowser\/([0-9.]+)/;
                } else if (/\buc\/[0-9]/.test(ua)) {
                    return /\buc\/([0-9.]+)/;
                } else if (ua.indexOf("ucweb") >= 0) {
                    return /\bucweb[\/]?([0-9.]+)?/;
                } else {
                    return /\b(?:ucbrowser|uc)\b/;
                }
            }
        ], // Android 默认浏览器。该规则需要在 safari 之前。
        ["android",
            function(ua) {
                if (ua.indexOf("android") === -1) {
                    return;
                }
                return /\bversion\/([0-9.]+(?: beta)?)/;
            }
        ],
        ["safari", /\bversion\/([0-9.]+(?: beta)?)(?: mobile(?:\/[a-z0-9]+)?)? safari\//], // 如果不能被识别为 Safari，则猜测是 WebView。
        ["webview", /\bcpu(?: iphone)? os (?:[0-9._]+).+\bapplewebkit\b/],
        ["firefox", /\bfirefox\/([0-9.ab]+)/],
        ["nokia", /\bnokiabrowser\/([0-9.]+)/]
    ];
    /**
     * UserAgent Detector.
     * @param {String} ua, userAgent.
     * @param {Object} expression
     * @return {Object}
     *    返回 null 表示当前表达式未匹配成功。
     */

    function detect(name, expression, ua) {
        var expr = isFunction(expression) ? expression.call(null, ua) : expression;
        if (!expr) {
            return null;
        }
        var info = {
            name: name,
            version: NA_VERSION,
            codename: ""
        };
        var t = toString(expr);
        if (expr === true) {
            return info;
        } else if (t === "[object String]") {
            if (ua.indexOf(expr) !== -1) {
                return info;
            }
        } else if (isObject(expr)) {
            // Object
            if (expr.hasOwnProperty("version")) {
                info.version = expr.version;
            }
            return info;
        } else if (expr.exec) {
            // RegExp
            var m = expr.exec(ua);
            if (m) {
                if (m.length >= 2 && m[1]) {
                    info.version = m[1].replace(/_/g, ".");
                } else {
                    info.version = NA_VERSION;
                }
                return info;
            }
        }
    }
    var na = {
        name: "na",
        version: NA_VERSION
    };
    // 初始化识别。

    function init(ua, patterns, factory, detector) {
        var detected = na;
        each(patterns, function(pattern) {
            var d = detect(pattern[0], pattern[1], ua);
            if (d) {
                detected = d;
                return false;
            }
        });
        factory.call(detector, detected.name, detected.version);
    }
    /**
     * 解析 UserAgent 字符串
     * @param {String} ua, userAgent string.
     * @return {Object}
     */
    var parse = function(ua) {
        ua = (ua || "").toLowerCase();
        var d = {};
        init(ua, DEVICES, function(name, version) {
            var v = parseFloat(version);
            d.device = {
                name: name,
                version: v,
                fullVersion: version
            };
            d.device[name] = v;
        }, d);
        init(ua, OS, function(name, version) {
            var v = parseFloat(version);
            d.os = {
                name: name,
                version: v,
                fullVersion: version
            };
            d.os[name] = v;
        }, d);
        var ieCore = IEMode(ua);
        init(ua, ENGINE, function(name, version) {
            var mode = version;
            // IE 内核的浏览器，修复版本号及兼容模式。
            if (ieCore) {
                version = ieCore.engineVersion || ieCore.engineMode;
                mode = ieCore.engineMode;
            }
            var v = parseFloat(version);
            d.engine = {
                name: name,
                version: v,
                fullVersion: version,
                mode: parseFloat(mode),
                fullMode: mode,
                compatible: ieCore ? ieCore.compatible : false
            };
            d.engine[name] = v;
        }, d);
        init(ua, BROWSER, function(name, version) {
            var mode = version;
            // IE 内核的浏览器，修复浏览器版本及兼容模式。
            if (ieCore) {
                // 仅修改 IE 浏览器的版本，其他 IE 内核的版本不修改。
                if (name === "ie") {
                    version = ieCore.browserVersion;
                }
                mode = ieCore.browserMode;
            }
            var v = parseFloat(version);
            d.browser = {
                name: name,
                version: v,
                fullVersion: version,
                mode: parseFloat(mode),
                fullMode: mode,
                compatible: ieCore ? ieCore.compatible : false
            };
            d.browser[name] = v;
        }, d);
        return d;
    };
    detector = parse(userAgent + " " + appVersion + " " + vendor);
    detector.parse = parse;

    // exports add
    function mixTo(r, s) {
        var p;
        for (p in s) {
            if (s.hasOwnProperty(p)) {
                r[p] = s[p];
            }
        }
    }
    var mobilePattern = /(iPod|iPhone|Android|Opera Mini|BlackBerry|webOS|UCWEB|Blazer|PSP|IEMobile|Symbian)/g;
    var decideMobile = function(ua) {
        var match = mobilePattern.exec(ua);
        return match ? match[1]: '';
    };

    detector.mobile = decideMobile(userAgent);

    mixTo(exports, {
        detector: detector,
        decideMobile: decideMobile,
        isIE6: detector.browser.ie && detector.browser.version == 6,
        isMobile: !!detector.mobile
    });
})(tbtx);


;(function($, exports) {
    // Position
    // --------
    // 定位工具组件，将一个 DOM 节点相对对另一个 DOM 节点进行定位操作。
    // 代码易改，人生难得
    var Position = exports, VIEWPORT = {
        _id: "VIEWPORT",
        nodeType: 1
    }, isPinFixed = false, ua = (window.navigator.userAgent || "").toLowerCase(), isIE6 = ua.indexOf("msie 6") !== -1;
    // 将目标元素相对于基准元素进行定位
    // 这是 Position 的基础方法，接收两个参数，分别描述了目标元素和基准元素的定位点
    Position.pin = function(pinObject, baseObject) {
        // 将两个参数转换成标准定位对象 { element: a, x: 0, y: 0 }
        pinObject = normalize(pinObject);
        baseObject = normalize(baseObject);
        // 设定目标元素的 position 为绝对定位
        // 若元素的初始 position 不为 absolute，会影响元素的 display、宽高等属性
        var pinElement = $(pinObject.element);
        if (pinElement.css("position") !== "fixed" || isIE6) {
            pinElement.css("position", "absolute");
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
        var top = baseOffset.top + baseObject.y - pinObject.y - parentOffset.top;
        var left = baseOffset.left + baseObject.x - pinObject.x - parentOffset.left;
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
            x: "50%",
            y: "50%"
        }, {
            element: baseElement,
            x: "50%",
            y: "50%"
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
            throw new Error("posObject.element is invalid.");
        }
        var result = {
            element: element,
            x: posObject.x || 0,
            y: posObject.y || 0
        };
        // config 的深度克隆会替换掉 Position.VIEWPORT, 导致直接比较为 false
        var isVIEWPORT = element === VIEWPORT || element._id === "VIEWPORT";
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
        pinObject.x = xyConverter(pinObject.x, pinObject, "width");
        pinObject.y = xyConverter(pinObject.y, pinObject, "height");
    }
    // 处理 x, y 值，都转化为数字
    function xyConverter(x, pinObject, type) {
        // 先转成字符串再说！好处理
        x = x + "";
        // 处理 px
        x = x.replace(/px/gi, "");
        // 处理 alias
        if (/\D/.test(x)) {
            x = x.replace(/(?:top|left)/gi, "0%").replace(/center/gi, "50%").replace(/(?:bottom|right)/gi, "100%");
        }
        // 将百分比转为像素值
        if (x.indexOf("%") !== -1) {
            //支持小数
            x = x.replace(/(\d+(?:\.\d+)?)%/gi, function(m, d) {
                return pinObject.size()[type] * (d / 100);
            });
        }
        // 处理类似 100%+20px 的情况
        if (/[+\-*\/]/.test(x)) {
            try {
                // eval 会影响压缩
                // new Function 方法效率高于 for 循环拆字符串的方法
                // 参照：http://jsperf.com/eval-newfunction-for
                x = new Function("return " + x)();
            } catch (e) {
                throw new Error("Invalid position value: " + x);
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
            parent.css("zoom", 1);
        }
        // 获取 offsetParent 的 offset
        var offset;
        // 当 offsetParent 为 body，
        // 而且 body 的 position 是 static 时
        // 元素并不按照 body 来定位，而是按 document 定位
        // http://jsfiddle.net/afc163/hN9Tc/2/
        // 因此这里的偏移值直接设为 0 0
        if (parent[0] === document.body && parent.css("position") === "static") {
            offset = {
                top: 0,
                left: 0
            };
        } else {
            offset = getOffset(parent[0]);
        }
        // 根据基准元素 offsetParent 的 border 宽度，来修正 offsetParent 的基准位置
        offset.top += numberize(parent.css("border-top-width"));
        offset.left += numberize(parent.css("border-left-width"));
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
        var box = element.getBoundingClientRect(), docElem = document.documentElement;
        // < ie8 不支持 win.pageXOffset, 则使用 docElem.scrollLeft
        return {
            left: box.left + (window.pageXOffset || docElem.scrollLeft) - (docElem.clientLeft || document.body.clientLeft || 0),
            top: box.top + (window.pageYOffset || docElem.scrollTop) - (docElem.clientTop || document.body.clientTop || 0)
        };
    }
})(jQuery, tbtx);

;(function(S) {
    var parseResult = S.parseUrl(location.href);
    parseResult.query = S.getQueryParam();
    S.data("urlInfo", parseResult);

    var ROOT = parseResult.scheme + "://" + parseResult.domain;
    if (parseResult.port) {
        ROOT += ":" + parseResult.port;
    }

    if (!(/^http/i).test(ROOT)) {
        ROOT = '';
    }

    var path = {
        getuserinfo: '/interface/getuserinfo.htm',
        getlogininfo: '/interface/getlogininfo.htm',       // 临时登陆状态判断
        taobao_login_page : '/applogin.htm',
        login: '/applogin.htm?ref=' + encodeURIComponent(location.href)
    };


    S.mix({
        ROOT: ROOT,
        path: path
    });
})(tbtx);


;(function(global, $, S) {
    var noop = S.noop,
        each = S.each,
        map = S.map,
        ucfirst = S.ucfirst,
        startsWith = S.startsWith,
        singleton = S.singleton,
        throttle = S.throttle,
        isArray = S.isArray,
        isFunction = S.isFunction;

    var doc = document,
        de = doc.documentElement,
        head = doc.head || doc.getElementsByTagName("head")[0] || de;

    var baseElement = head.getElementsByTagName("base")[0];
    var IS_CSS_RE = /\.css(?:\?|$)/i;
    var READY_STATE_RE = /^(?:loaded|complete|undefined)$/;

    // `onload` event is not supported in WebKit < 535.23 and Firefox < 9.0
    // ref:
    //  - https://bugs.webkit.org/show_activity.cgi?id=38995
    //  - https://bugzilla.mozilla.org/show_bug.cgi?id=185236
    //  - https://developer.mozilla.org/en/HTML/Element/link#Stylesheet_load_events
    var isOldWebKit = (navigator.userAgent.replace(/.*AppleWebKit\/(\d+)\..*/, "$1")) * 1 < 536;

    // 存储每个url的deferred对象
    var deferredMap = {};

    function request(url, callback, charset) {
        // 去掉script的url参数
        // if (url.indexOf("?") > -1) {
        //     url = url.split("?")[0];
        // }
        // 该url已经请求过，直接done
        var deferred = deferredMap[url];
        if (deferred) {
            deferred.done(callback);
            return deferred.promise();
        } else {    //
            deferred = deferredMap[url] = $.Deferred();
            deferred.done(callback);
        }

        var isCSS = IS_CSS_RE.test(url);
        var node = doc.createElement(isCSS ? "link" : "script");

        if (charset) {
            var cs = isFunction(charset) ? charset(url) : charset;
            if (cs) {
                node.charset = cs;
            }
        }

        addOnload(node, callback, isCSS, url);

        if (isCSS) {
            node.rel = "stylesheet";
            node.href = url;
        } else {
            node.async = true;
            node.src = url;
        }

        // ref: #185 & http://dev.jquery.com/ticket/2709
        if (baseElement) {
            head.insertBefore(node, baseElement);
        } else {
            head.appendChild(node);
        }

        return deferredMap[url].promise();
    }

    function addOnload(node, callback, isCSS, url) {
        // 不支持 onload事件
        var missingOnload = isCSS && (isOldWebKit || !("onload" in node));

        // for Old WebKit and Old Firefox
        if (missingOnload) {
            setTimeout(function() {
                pollCss(node, callback, url);
            }, 1); // Begin after node insertion
            return;
        }

        // 支持onload事件
        node.onload = node.onerror = node.onreadystatechange = function() {
            if (READY_STATE_RE.test(node.readyState)) {

                // Ensure only run once and handle memory leak in IE
                node.onload = node.onerror = node.onreadystatechange = null;

                // Remove the script to reduce memory leak
                if (!isCSS) {
                    head.removeChild(node);
                }

                // Dereference the node
                node = null;


                deferredMap[url].resolve();
                // alert("resolve");
                // callback();
            }
        };
    }

    function pollCss(node, callback, url) {
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
                deferredMap[url].resolve();
                // Place callback here to give time for style rendering
                // callback();
            } else {
                pollCss(node, callback);
            }
        }, 20);
    }

    // 获取脚本的绝对url
    function getScriptAbsoluteSrc(node) {
        return node.hasAttribute ? // non-IE6/7
            node.src :
            // see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
            node.getAttribute("src", 4);
    }

    var SCHEME_RE = /^(http|file)/i;
    /**
     * 请求的相对url转为绝对
     * @param  {string} url
     * @return {string} normalizedUrl
     */
    function normalizeUrl(url) {
        if (!SCHEME_RE.test(url)) {
            url = S.staticUrl + "/" + url;
        }
        return url;
    }

    function loadCss(url, callback, charset) {
        url = normalizeUrl(url);
        return request(url, callback, charset);
    }

    function loadScript(url, callback, charset) {
        // url传入数组，按照数组中脚本的顺序进行加载
        if (isArray(url)) {
            var chain,
                length = url.length;

            url = map(url, function(item) {
                return normalizeUrl(item);
            });

            // 如果使用deferred的resolve date来解决时，不能同时请求
            chain = request(url[0], noop, charset);
            S.reduce(url, function(prev, now, index, array) {
                chain = chain.then(function() {
                    return request(now, noop, charset);
                });

                // reduce的返回
                return now;
            });
            return chain.then(callback);
        }
        return request(normalizeUrl(url), callback, charset);
    }

    // 获取tbtx所在script的的src
    function getLoaderSrc() {
        var scripts = doc.scripts;
        var node,
            src;

        for (var i = scripts.length - 1; i >= 0; i--) {
            node = scripts[i];
            src = getScriptAbsoluteSrc(node);
            if (src && /tbtx\.(min\.)?js/.test(src)) {
                return src;
            }
        }
        return null;
    }

    // file:///E:/tbcdn or cdn(如a.tbcdn.cn/apps/tbtx)
    // 使用tbtx所在script获取到staticUrl
    // 除非脚本名不是tbtx.js or tbtx.min.js，使用默认的staticUrl
    var loaderSrc = getLoaderSrc();
    if (loaderSrc) {
        var pathArray = loaderSrc.split('/'),
            deep = 3;
        pathArray.splice(pathArray.length - deep, deep);  // delete base js tbtx.js
        S.staticUrl = pathArray.join("/");
    }
    // end request

    // jQuery singleton instances
    var $instances = [
        ["window", function() {
            return $(window);
        }],
        ["document", function() {
            return $(doc);
        }],
        ["head", function() {
            return $(head);
        }],
        ["body", function() {
            return $('body');
        }]
    ];
    each($instances, function(instance) {
        S["get" + ucfirst(instance[0])] = singleton(instance[1]);
    });

    var getDocument = S.getDocument,
        getWindow = S.getWindow,

        pageHeight = function() {
            return getDocument().height();
            // return doc.body.scrollHeight;
        },
        pageWidth = function() {
            return getDocument().width();
            // return doc.body.scrollWidth;
        },

        scrollX = function() {
            return getWindow().scrollLeft();
            // return window.pageXOffset || (de && de.scrollLeft) || doc.body.scrollLeft;
        },
        scrollY = function() {
            return getWindow().scrollTop();
            // return window.pageYOffset || (de && de.scrollTop) || doc.body.scrollTop;
        },

        viewportHeight = function() {
            return getWindow().height();
            // var de = document.documentElement;      //IE67的严格模式
            // return window.innerHeight || (de && de.clientHeight) || doc.body.clientHeight;
        },
        viewportWidth = function() {
            return getWindow().width();
            // return window.innerWidth || (de && de.clientWidth) || doc.body.clientWidth;
        },

        fullViewport = function(selector) {
            return $(selector).css({
                width: viewportWidth(),
                height: viewportHeight()
            });
        },

        fullPage = function(selector) {
            return $(selector).css({
                width: pageWidth(),
                height: pageHeight()
            });
        },

        getScroller = singleton(function() {
            var scroller = document.body;
            if (/msie [67]/.test(navigator.userAgent.toLowerCase())) {
                scroller = document.documentElement;
            }
            return $(scroller);
        }),
        /**
         * 停止body的滚动条
         * @return {[type]} [description]
         */
        stopBodyScroll = function() {
            getScroller().css("overflow", "hidden");
            return this;
        },
        /**
         * 恢复body的滚动条
         * @return {[type]} [description]
         */
        resetBodyScroll = function() {
            getScroller().css("overflow", "auto");
            return this;
        },

        contains = $.contains || function(a, b) {
            //noinspection JSBitwiseOperatorUsage
            return !!(a.compareDocumentPosition(b) & 16);
        },
        isInDocument = function(element) {
            return contains(de, element);
        },

        // 距离topline多少px才算inView
        // 元素是否出现在视口内
        // 超出也不在view
        isInView = function(selector, top) {
            top = top || 0;

            var $element = $(selector),
                viewportHeight = S.viewportHeight(),
                scrollY = S.scrollY();

            if (top == "center" || typeof top !== "number") {
                top = (viewportHeight - $element.innerHeight())/2;
            }

            // 视口上下位置
            var topLine = scrollY,
                bottomLine = topLine + viewportHeight,
                baseline = $element.offset().top + top;

            return baseline > topLine && baseline < bottomLine;
        },

        scrollTo = function(selector) {
            var top;
            if (typeof selector == "number") {
                top = selector;
            } else {
                var $target = $(selector),
                    offsetTop = $target.offset().top;

                top = offsetTop - (viewportHeight() - $target.innerHeight())/2;
            }

            $('body,html').animate({
                scrollTop: top
            }, 800);
            return this;
        },

        limitLength = function(selector, attr, suffix) {
            var $elements = $(selector);
            suffix = suffix || '...';
            attr = attr || 'data-max';

            $elements.each(function() {
                var $element = $(this);
                var max = parseInt($element.attr(attr), 10);
                var conent = $.trim($element.text());
                if (conent.length <= max) {
                    return;
                }

                conent = conent.slice(0, max - suffix.length) + suffix;
                $element.text(conent);
            });
            return this;
        },

        flash = function(selector, flashColor, bgColor) {
            var $elements = $(selector);
            bgColor = bgColor || "#FFF";
            flashColor = flashColor || "#FF9";
            $elements.each(function(index, element) {
                var $element = $(element);
                $element.css("background-color", flashColor).fadeOut("fast", function() {
                    $element.fadeIn("fast", function() {
                        $element.css("background-color", bgColor);
                    });
                });
            });
            return this;
        },
        // 返回顶部
        flyToTop = function(selector) {
            var $container = $(selector);

            // 大于offset消失
            var offset = $container.data("offset");
            if (offset) {
                // fade in #back-top
                S.on("window.scroll", function(top) {
                    if (top > offset) {
                        $container.fadeIn();
                    } else {
                        $container.fadeOut();
                    }
                });
            }

            // 默认监听J-fly-to-top, 没找到则监听自身
            var $flyer = $container.find(".J-fly-to-top"),
                $listener = $flyer.length ? $flyer : $container;

            $listener.on('click', function(){
                scrollTo(0);
                return false;
            });
            return this;
        },

        initWangWang = function(callback) {
            callback = callback || noop;
            var webww = "http://a.tbcdn.cn/p/header/webww-min.js";
            if (global.KISSY) {
                loadScript(webww, callback);
            } else {
                loadScript(["http://a.tbcdn.cn/s/kissy/1.2.0/kissy-min.js", webww], callback);
            }
            return this;
        };

    setTimeout(function() {
        var $window = getWindow();
        var winWidth = $window.width();
        var winHeight = $window.height();
        var scrollTop = $window.scrollTop();
        $window.on("resize", throttle(function() {
            // 干掉JSHint的检测
            var winNewWidth = $window.width();
            var winNewHeight = $window.height();
            // IE678 莫名其妙触发 resize
            // http://stackoverflow.com/questions/1852751/window-resize-event-firing-in-internet-explorer
            if (winWidth !== winNewWidth || winHeight !== winNewHeight) {
                S.trigger("window.resize", winNewWidth, winNewHeight);
            }
            winWidth = winNewWidth;
            winHeight = winNewHeight;
        }, 80)).on("scroll", throttle(function() {
            var scrollNewTop = $window.scrollTop();
            if (scrollTop !== scrollNewTop) {
                S.trigger("window.scroll", scrollNewTop, scrollTop);
                // if (scrollTop > scrollNewTop) {
                //     S.trigger("window.scroll.up", scrollNewTop, scrollTop);
                // } else {
                //     S.trigger("window.scroll.down", scrollNewTop, scrollTop);
                // }
            }

            scrollTop = scrollNewTop;
        }, 80));
    }, 0);

    S.mix({
        // load
        loadCss: loadCss,
        loadScript: loadScript,
        // page & viewport
        pageWidth: pageWidth,
        pageHeight: pageHeight,
        scrollY: scrollY,
        scrollX: scrollX,
        viewportHeight: viewportHeight,
        viewportWidth: viewportWidth,
        fullViewport: fullViewport,
        fullPage: fullPage,

        stopBodyScroll: stopBodyScroll,
        resetBodyScroll: resetBodyScroll,

        contains: contains,
        isInDocument: isInDocument,
        // support fn
        isInView: isInView,
        scrollTo: scrollTo,
        limitLength: limitLength,
        initWangWang: initWangWang,
        flash: flash,
        flyToTop: flyToTop
    });
})(this, jQuery, tbtx);


;(function(S) {
    // 简单模块定义和加载
    var Loader = S.namespace("Loader"),

        // 缓存计算过的依赖
        dependenciesMap = Loader.dependenciesMap = {},

        data = Loader.data = {
            baseUrl: S.staticUrl + "/base/js/component/",
            urlArgs: "2013.12.19.0",
            paths: {

            },

            deps: {
                drop: "overlay",
                popup: "overlay"
            }
        };

    Loader.config = function(val) {
        return $.extend(true, data, val);
    };

    S.require = function(names, callback, baseUrl) {
        baseUrl = baseUrl || data.baseUrl;
        callback = callback || S.noop;

        if (!S.isArray(names)) {
            names = [names];
        }

        // 获取各个的依赖，将依赖最多的排在前面来进行unique
        var deps = sortDeps(names);

        // 加上自身，unique
        deps = deps.concat(names);
        deps = S.unique(deps);

        var scripts = getScripts(deps, baseUrl);
        return S.loadScript(scripts, callback);
    };

    function getScripts(deps, baseUrl) {
        var paths = data.paths;
        return S.map(deps, function(item) {
            var path = paths[item] || item,
                ret =  baseUrl + path;
            if (!S.endsWith(ret, ".js")) {
                ret += ".js";
            }
            ret += "?" + data.urlArgs;
            return ret;
        });
    }

    function sortDeps(names) {
        var depsSorted = [];
        S.each(names, function(name) {
            depsSorted.push(getDeps(name));
        });
        depsSorted.sort(function(v1, v2) {
            return v1.length < v2.length;
        });
        return S.reduce(depsSorted, function(prev, now) {
            return prev.concat(now);
        });
    }
    /*
     * 获取模块依赖
     * 暂时只处理组件之间的依赖
     * 外部的依赖请自行处理
     */
    function getDeps(name) {
        var ret = [],
            i,
            // 依赖配置
            depsConfig = data.deps,
            deps = depsConfig[name];

        // 没有计算过依赖
        if (!dependenciesMap[name]) {
            // 有依赖
            if (deps) {
                // 保证deps为数组
                if (!S.isArray(deps)) {
                    deps = [deps];
                }

                S.each(deps, function(dep) {
                    ret.unshift(dep);
                    ret = getDeps(dep).concat(ret);
                });
            }
            dependenciesMap[name] = ret;
        }
        return dependenciesMap[name];
    }
})(tbtx);

;(function($, S) {
    var doc = document;
    var support = S.namespace("support");

    function transitionEnd() {
        var el = document.createElement('support');

        var transEndEventNames = {
            'WebkitTransition': 'webkitTransitionEnd',
            'MozTransition': 'transitionend',
            'OTransition': 'oTransitionEnd otransitionend',
            'transition': 'transitionend'
        };

        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return {
                    end: transEndEventNames[name]
                };
            }
        }
    }

    $.extend(support, {
        transition: transitionEnd(),
        placeholder: 'placeholder' in doc.createElement('input')
    });

    // fix placeholder
    $(function() {
        if (!support.placeholder && $("input[placeholder], textarea[placeholder]").length) {
            /*
                input, textarea { color: #000; }
                .placeholder { color: #aaa; }
             */
            S.loadScript("base/js/plugin/jquery.placeholder.js", function() {
                $('input, textarea').placeholder();
            });
        }
    });
})(jQuery, tbtx);


;(function($, S) {
    var Class = S.Class,
        Widget = S.Widget,
        singleton = S.singleton;

    var ua = (window.navigator.userAgent || "").toLowerCase(),
        isIE6 = ua.indexOf("msie 6") !== -1;

    var MsgItemWidget = new Class(Widget, {
        attrs: {
            type: "",
            msg: "",
            duration: 200,
            template: '<p></p>',
            className: "tbtx-msg-item"
        },

        render: function() {
            MsgItemWidget.superclass.render.apply(this, arguments);

            var width = this.element.width();
            this.element.css({
                left: -width,
                opacity: 0
            }).animate({
                left: 0,
                opacity: 1
            }, this.get("duration"));

            return this;
        },

        _onRenderType: function(val) {
            this.element.addClass('tbtx-msg-' + val);
        },
        _onRenderMsg: function(val) {
            this.element.html(val);
        },

        destroy: function() {
            var width = this.element.width(),
                self = this;
            this.element.animate({
                left: -width,
                opacity: 0
            }, this.get("duration"), function() {
                MsgItemWidget.superclass.destroy.call(self);
            });
        }
    });

    var MsgWidget = new Class(Widget, {
        attrs: {
            items: {
                value: "p",
                getter: function(val) {
                    return this.$(val);
                }
            },
            last: 10000
        },
        events: {
            "click p": "_removeHandler"
        },
        add: function(msg, type) {
            var items = this.get("items");
            if (items.length > 10) {
                this.remove(items.first());
            }

            var item = new MsgItemWidget({
                msg: msg,
                type: type,
                parentNode: this.element
            }).render();

            var self = this;
            setTimeout(function() {
                self.remove(item.element);
            }, this.get("last"));
        },

        remove: function($item) {
            var widget = Widget.query($item);
            if (widget) {
                widget.destroy();
            }
        },

        _removeHandler: function(ev) {
            this.remove($(ev.target));
        }
    });

    var pin = function($element) {
        S.pin({
            element: $element,
            x: 0,
            y: "100%+24"
        }, {
            element: S.VIEWPORT,
            x: 0,
            y: "100%"
        });
    };
    var getWidget = singleton(function() {
        S.loadCss("base/css/msg.css");
        var widget = new MsgWidget({
            id: "tbtx-msg"
        }).render();

        if (isIE6) {
            pin(widget.element);
            S.on("window.scroll window.resize", function() {
                if (widget.get("items").length) {
                    pin(widget.element);
                }
            });
        }

        return widget;
    });

    var MSG = S.MSG = {};
    var types = "warning error info debug success".split(" ");
    S.each(types, function(type) {
        S[type] = MSG[type] = function(msg) {
            getWidget().add(msg, type);
        };
    });
})(jQuery, tbtx);

;(function($, S) {
    var isPending = S.isPending,
        PATH = S.path,
        TIMEOUT = 10000;

    // cookie写入JSToken，服务器端处理后清掉，如果url的token跟cookie的不对应则
    // 参数非法，防止重复提交
    var miieeJSToken = function() {
        var token = Math.random().toString().substr(2) + (new Date()).getTime().toString().substr(1) + Math.random().toString().substr(2);
        S.cookie.set('MIIEE_JTOKEN', token, '', '', '/');
        return token;
    };

    // 临时跟真正登陆暂时没区分
    var userCheckDeferred;
    // 默认使用登陆接口，某些操作使用临时登陆状态即可
    var userCheck = function(callSuccess, callFailed, isTemp) {
        if (userCheckDeferred) {
            return userCheckDeferred.done(callSuccess).fail(callFailed);
        }
        userCheckDeferred = $.Deferred();
        $.ajax({
            type: "POST",
            url: isTemp ?  PATH.getlogininfo : PATH.getuserinfo,
            dataType: 'json',
            data: {},
            timeout: TIMEOUT
        }).done(function(response) {
            var data = response.result && response.result.data,
                code = response.code;

            if (code == 601) {
                userCheckDeferred.reject();
            } else if (S.inArray([100, 608, 1000], code)) {
                S.data('user', data);
                S.data('userName', data.trueName ? data.trueName : data.userNick);
                userCheckDeferred.resolve(data);
            }
        }).fail(function() {
            userCheckDeferred.reject();
        });

        userCheckDeferred.done(callSuccess).fail(callFailed).fail(function() {
            // J-login 链接改为登陆
            $('.J-login').attr({
                href: PATH.login,
                target: "_self"
            });
        });
        return userCheckDeferred.promise();
    };


    var config = {
        miiee: {
            appkey: "2328604005",
            uid: "1644022571"       // 实际上该uid为tbtx, miiee2690564321
        },
        brand: {
            appkey: "2328604005",       // 暂时使用miiee的appkey
            uid: "2140361617"
        },
        tbtx: {
            appkey: "2328604005",
            uid: "1644022571"
        },
        maijia: {
            uid: "1771650130"
        }
    };
    var shareToSinaWB = function(selecotr, title, url, pic, site, uid) {
        uid = uid || '';
        site = site || "miiee";
        pic = pic || '';
        url = url || window.location.href;
        title = title || $('meta[name="description"]').attr("content");

        var base = 'http://v.t.sina.com.cn/share/share.php?';
        var params = {
            appkey: config[site].appkey || "", // appkey
            url: url,
            title: title,
            ralateUid: uid || config[site].uid, // @user
            pic: pic
        };

        var link = base + $.param(params);
        $(selecotr).attr({
            href: link,
            target: "_blank"
        });
    };

    var requestFailCode = -1,
        requestMap = {},
        /**
         * 适用于用到jtoken的请求
         */
        Request = function(url, data, successCode) {
            successCode = successCode || Request.successCode || [100];
            data = data || {};
            if (!data.jtoken) {
                data.jtoken = miieeJSToken();
            }

            var deferred = requestMap[url];
            // 正在处理中
            if (deferred && isPending(deferred)) {
                deferred.notify("requesting");
                return deferred.promise();
            }

            deferred = requestMap[url] = $.Deferred();
            $.ajax({
                url: url,
                type: 'post',
                dataType: 'json',
                data: data,
                timeout: TIMEOUT
            })
            .done(function(response) {
                var code = response && response.code;
                if (S.inArray(successCode, code)) {
                    deferred.resolve(response);
                } else {
                    deferred.reject(code, response);
                }
            })
            .fail(function() {
                deferred.reject(requestFailCode);
            });

            return deferred.promise();
        };

    S.mix({
        miieeJSToken: miieeJSToken,
        userCheck: userCheck,
        Request: Request,

        /**
         * 概率选中, 用于概率执行某操作
         * 从1开始记
         * 如70%的概率则为 bingoRange 70, range 100 or 7-10
         * @param  {number} bingoRange 选中的范围
         * @param  {number} range      总范围
         * @return {boolean}           是否中
         */
        bingo: function(bingoRange, range) {
            if (bingoRange > range) {
                return false;
            }
            range = range || 100;

            var seed = S.choice(1, range + 1);
            if (seed <= bingoRange) {
                return true;
            } else {
                return false;
            }
        },

        shareToSinaWB: shareToSinaWB,

        addToFavourite: function(title, url) {
            url = url || document.location.href;
            title = title || document.title;

            var def = function() {
                S.MSG.info('按下 ' + (navigator.userAgent.toLowerCase().indexOf('mac') != -1 ? 'Command/Cmd' : 'CTRL') + ' + D 来收藏本页.');
            };

            try {
                // Internet Explorer
                window.external.AddFavorite(url, title);
            } catch (e) {       // 两个e不要一样
                try {
                    // Mozilla
                    window.sidebar.addPanel(title, url, "");
                } catch (ex) {
                    // Opera
                    // 果断无视opera
                    if (typeof(opera) == "object") {
                        def();
                        return true;
                    } else {
                        // Unknown
                        def();
                    }
                }
            }
        }
    });
})(jQuery, tbtx);
