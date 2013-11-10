(function(global, $) {
    var exports = global.tbtx;

    // 语言扩展
    var toString = Object.prototype.toString,

        AP = Array.prototype,

        isString = function(val) {
            return toString.call(val) === '[object String]';
        },

        isNotEmptyString = function(val) {
            return isString(val) && val !== '';
        },

        isArray = Array.isArray || function(val) {
            return toString.call(val) === '[object Array]';
        },

        inArray = function(arr, item) {
            return indexOf(arr, item) > -1;
        },

        // 修正IE7以下字符串不支持下标获取字符
        indexOf = AP.indexOf ?
            function(arr, item) {
                return arr.indexOf(item);
        } :
            function(arr, item) {
                var i;
                if (typeof arr == 'string') {
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

        filter = AP.filter ? function(arr, fn, context) {
            return AP.filter.call(arr, fn, context);
        } : function(arr, fn, context) {
            var ret = [];
            $.each(arr, function(i, item) {
                if (fn.call(context || this, item, i, arr)) {
                    ret.push(item);
                }
            });
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
                random;
            if (isArray(m)) {
                array = m;
                m = 0;
                n = array.length;
            }
            var tmp;
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
        Class = function(parent) {
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

                var proto = createProto(parent.prototype);
                mix(proto, klass.prototype);
                klass.prototype = proto;

                // ClassA.superclass.method显示调用父类方法
                klass.superclass = parent.prototype;
            }

            // klass.prototype.init = function() {}; // need to be overwrite
            klass.fn = klass.prototype;
            klass.fn.constructor = klass;
            klass.fn.parent = klass;

            mix(klass, Class.Mutators);
            klass.fn.proxy = klass.proxy;

            return klass;
        },

        Now = Date.now || function() {
            return +new Date();
        },

        // 在underscore里面有实现，这个版本借鉴的是kissy
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

        // 函数柯里化
        // 调用同样的函数并且传入的参数大部分都相同的时候，就是考虑柯里化的理想场景
        curry = function(fn) {
            var slice = [].slice,
                args = slice.call(arguments, 1);

            return function() {
                var innerArgs = slice.call(arguments),
                    retArgs = args.concat(innerArgs);

                return fn.apply(null, retArgs);
            };
        },

        // {{ name }} -> {{ o[name] }}
        // \{{}} -> \{{}}
        // based on Django, fix kissy, support blank -> {{ name }}, not only {{name}}
        substitute = function(str, o, regexp) {
            if (!isString(str)) {
                return str;
            }
            if ( !($.isPlainObject(o) || isArray(o)) ) {
                return str;
            }
            return str.replace(regexp || /\\?\{\{\s*([^{}\s]+)\s*\}\}/g, function(match, name) {
                if (match.charAt(0) === '\\') {
                    return match.slice(1);
                }
                return (o[name] === undefined) ? '' : o[name];
            });
        },

        // query字符串转为对象
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
                        tbtx.log(e + 'decodeURIComponent error : ' + val, 'error');
                    }
                }
                ret[key] = val;
            }
            return ret;
        },

        getQueryParam = function(name, url) {
            if (!url) {
                url = location.href;
            }
            var ret;

            var search;
            if (url.indexOf('?') > -1) {
                search = url.split('?')[1];
            } else {
                ret = name ? '': {};
                return ret;
            }

            ret = unparam(search);
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
        EMPTY = '',
        getEscapeReg = function() {
            if (escapeReg) {
                return escapeReg;
            }
            var str = EMPTY;
            $.each(htmlEntities, function(index, entity) {
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
            $.each(reverseEntities, function(index, entity) {
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
        },
        include: function(object) {
            var included = object.included;

            mix(this.prototype, object, ['included']);

            if (included) {
                included(this);
            }
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
    }
    function classify(cls) {
        cls.Implements = Implements;
        return cls;
    }

    var mix = exports.mix = function(des, source, blacklist, over) {
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

    // exports
    exports.mix({
        mix: mix,
        classify: classify,
        isNotEmptyString: isNotEmptyString,
        isArray: isArray,
        inArray: inArray,
        indexOf: indexOf,
        filter: filter,
        keys: keys,
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
        getQueryParam: getQueryParam,
        escapeHtml: escapeHtml,
        unEscapeHtml: unEscapeHtml
    });
})(this, jQuery);
