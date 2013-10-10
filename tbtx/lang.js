(function(global) {
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

        indexOf = AP.indexOf ?
            function(arr, item) {
                return arr.indexOf(item);
        } :
            function(arr, item) {
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i] === item) {
                        return i;
                    }
                }
                return -1;
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
        keys = function(o) {
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

        // oo实现
        Class = function(parent) {
            var klass = function() {
                this.init.apply(this, arguments);
            };

            if (parent) {
                var subclass = function() {};
                subclass.prototype = parent.prototype;
                klass.prototype = new subclass();
            }

            klass.prototype.init = function() {}; // need to be overwrite
            klass.fn = klass.prototype;

            klass.fn.constructor = klass;
            klass.fn.parent = klass;

            // 在事件处理程序中保证this指向klass, not 事件发生元素
            klass.proxy = function(func) {
                var self = this;
                return (function() {
                    return func.apply(self, arguments);
                });
            };
            klass.fn.proxy = klass.proxy;

            // 添加类属性
            klass.extend = function(object) {
                var extended = object.extended;

                mix(klass, object, ['extended']);

                if (extended) {
                    extended(klass);
                }
            };

            // 向原型上添加实例属性
            klass.include = function(object) {
                var included = object.included;

                mix(klass.fn, object, ['included']);

                if (included) {
                    included(klass);
                }
            };

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

    var mix = tbtx.mix = function(des, source, blacklist, over) {
        var i;
        if (!des || des === source) {
            return des;
        }
        // 扩展自身
        if (!source) {
            source = des;
            des = tbtx;
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
    mix({
        mix: mix,
        isNotEmptyString: isNotEmptyString,
        isArray: isArray,
        inArray: inArray,
        indexOf: indexOf,
        keys: keys,
        startsWith: startsWith,
        endsWith: endsWith,
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
})(this);
