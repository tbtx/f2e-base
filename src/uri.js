/**
 * Uri 相关
 */
(function(S, undefined) {

    var each = S.each,
        isString = S.isString,
        makeArray = S.makeArray;

    var EMPTY = "",

        encode = function (s) {
            return encodeURIComponent(String(s));
        },

        decode = function (s) {
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
                        buf.push(eq, encode(val + EMPTY));
                    }
                    buf.push(sep);
                }
            });

            buf.pop();
            return buf.join(EMPTY);
        },

        /**
         * query字符串转为对象
         */
        unparam = function(str, sep, eq) {
            if (!(isString(str) && (str = str.trim()))) {
                return {};
            }
            sep = sep || "&";
            eq = eq || "=";

            var ret = {},
                eqIndex,
                pairs = str.split(sep),
                key,
                val,
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
                        S.log(e + "decodeURIComponent error : " + val, "error", "unparam");
                    }
                }
                ret[key] = val;
            }
            return ret;
        };

    var Query = S.Query = function(query) {
        this._query = query || EMPTY;
        this._map = unparam(this._query);
    };

    Query.prototype = {

        /**
         * Return parameter value corresponding to current key
         * @param {String} [key]
         */
        get: function (key) {
            var _map = this._map;
            return key ? _map[key] : _map;
        },

        /**
         * Set parameter value corresponding to current key
         * @param {String} key
         * @param value
         * @chainable
         */
        set: function (key, value) {
            var query = this,
                _map = query._map;

            if (isString(key)) {
                _map[key] = value;
            } else {
                if (key instanceof Query) {
                    key = key.get();
                }
                each(key, function (v, k) {
                    _map[k] = v;
                });
            }
            return query;
        },

        /**
         * Remove parameter with specified name.
         * @param {String} key
         * @chainable
         */
        remove: function (keys) {
            var query = this;

            if (keys) {
                keys = makeArray(keys);
                keys.forEach(function(key) {
                    delete query._map[key];
                });
            } else {
                query._map = {};
            }
            return query;
        },

        /**
         * Add parameter value corresponding to current key
         * @param {String} key
         * @param value
         * @chainable
         */
        add: function (key, value) {
            var query = this,
                _map = query._map;

            if (isString(key)) {
                _map[key] = value;
            } else {
                if (key instanceof Query) {
                    key = key.get();
                }

                each(key, function(v, k) {
                    query.set(k, v);
                });
            }
            return query;
        },

        /**
         * Serialize query to string.
         */
        toString: function () {
            return param(this._map);
        }
    };


    // from caja uri
    var RE_URI = new RegExp([
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
        ].join(EMPTY)),

        REG_INFO = {
            scheme: 1,
            credentials: 2,
            domain: 3,
            port: 4,
            path: 5,
            query: 6,
            fragment: 7
        },

        defaultUri = location.href;

    var Uri = S.Uri = function(uriStr) {
        var uri = this,
            components = Uri.getComponents(uriStr);

        each(components, function (v, key) {

            if (key === "query") {
                // need encoded content
                uri.query = new Query(v);
            } else {
                // https://github.com/kissyteam/kissy/issues/298
                try {
                    v = decode(v);
                } catch (e) {
                    S.log(e + "urlDecode error : " + v, "error", "Uri");
                }
                // need to decode to get data structure in memory
                uri[key] = v;
            }
        });

        return uri;
    };

    Uri.prototype = {

        getFragment: function () {
            return this.fragment;
        },

        toString: function () {
            var out = [],
                uri = this,
                scheme = uri.scheme,
                domain = uri.domain,
                path = uri.path,
                port = uri.port,
                fragment = uri.fragment,
                query = uri.query.toString(),
                credentials = uri.credentials;

            if (scheme) {
                out.push(scheme);
                out.push(":");
            }

            if (domain) {
                out.push("//");
                if (credentials) {
                    out.push(credentials);
                    out.push("@");
                }

                out.push(encode(domain));

                if (port) {
                    out.push(":");
                    out.push(port);
                }
            }

            if (path) {
                out.push(path);
            }

            if (query) {
                out.push("?");
                out.push(query);
            }

            if (fragment) {
                out.push("#");
                out.push(fragment);
            }

            return out.join(EMPTY);
        }
    };

    Uri.getComponents = function (uri) {
        uri = uri || defaultUri;

        var m = uri.match(RE_URI) || [],
            ret = {};

        each(REG_INFO, function(index, key) {
            ret[key] = m[index] || EMPTY;
        });
        return ret;
    };


    function isValidParamValue(val) {
        var t = typeof val;
        // If the type of val is null, undefined, number, string, boolean, return TRUE.
        return val === null || (t !== "object" && t !== "function");
    }

    function isUri(val) {
        if (isString(val)) {
            var match = RE_URI.exec(val);
            return match && match[1];
        }
        return false;
    }

    /**
     * get/set/remove/add QueryParam
     * uri, args... or args.., uri
     */
    "add get remove set".split(" ").forEach(function(name) {
        S[name + "QueryParam"] = function() {
            var args = makeArray(arguments),
                length = args.length,
                // 第一个跟最后一个参数都可能是uri
                first = args[0],
                last = args[length - 1],
                uriStr;

            if (isUri(first)) {
                uriStr = first;
                args.shift();
            } else if (isUri(last)) {
                uriStr = last;
                args.pop();
            }

            var uri = new Uri(uriStr),
                query = uri.query,
                ret = query[name].apply(query, args);

            return ret === query ? uri.toString() : ret || EMPTY;
        };
    });

    S.mix({
        urlEncode: encode,
        urlDecode: decode,
        param: param,
        unparam: unparam,

        isUri: isUri,

        parseUri: function(uri) {
            return Uri.getComponents(uri);
        },

        getFragment: function(uri) {
            return new Uri(uri).getFragment();
        }
    });

    // 兼容之前的API
    S.parseUrl = S.parseUri;

})(tbtx);