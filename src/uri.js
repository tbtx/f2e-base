
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

    getComponents = function(uri) {
        uri = uri || location.href;

        var a = document.createElement('a'),
            protocol;

        a.href = uri;
        protocol = a.protocol;
        protocol = protocol.slice(0, protocol.length - 1);

        return {
            scheme: protocol,
            domain: a.hostname,
            port: a.port,
            path: a.pathname,
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

    ruri = /^(http|file|\/|\.)/,

    /**
     * 简单判断
     * 以http,file,/和.开头的为uri
     */
    isUri = function(val) {
        val += "";
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

extend({
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