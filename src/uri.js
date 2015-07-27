var lang = require('./lang'),
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