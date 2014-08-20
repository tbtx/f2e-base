/**
 * Uri 相关
 */
(function(S, undefined) {

    var each = S.each,
        isString = S.isString,
        makeArray = S.makeArray,
        memoize = S.memoize,
        log = S.log,

        encode = function(s) {
            return encodeURIComponent(s + "");
        },

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
                        buf.push(eq, encode(val + ""));
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
        unparam = memoize(function(str, sep, eq) {
            str = (str + "").trim();

            if (!str) {
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
                        log(e + "decodeURIComponent error : " + val);
                    }
                }
                ret[key] = val;
            }
            return ret;
        }, function(str, sep, eq) {
            return str + sep + eq;
        }),

        Query = S.Query = function(query) {
            this._query = query;
            this._map = unparam(this._query);
        },

        fn = Query.prototype = {

            /**
             * Return parameter value corresponding to current key
             * @param {String} [key]
             */
            get: function(key) {
                var _map = this._map;
                return key ? _map[key] : _map;
            },

            /**
             * Set parameter value corresponding to current key
             * @param {String} key
             * @param value
             * @chainable
             */
            set: function(key, value) {
                var query = this,
                    _map = query._map;

                if (isString(key)) {
                    _map[key] = value;
                } else {
                    if (key instanceof Query) {
                        key = key.get();
                    }
                    each(key, function(v, k) {
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
            remove: function(key) {
                var query = this;

                if (key) {
                    key = makeArray(key);
                    key.forEach(function(k) {
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

        rinfo = {
            scheme: 1,
            credentials: 2,
            domain: 3,
            port: 4,
            path: 5,
            query: 6,
            fragment: 7
        },

        Uri = S.Uri = function(uriStr) {
            var uri = this,
                components = Uri.getComponents(uriStr);

            each(components, function(v, key) {

                if (key === "query") {
                    // need encoded content
                    uri.query = new Query(v);
                } else {
                    // https://github.com/kissyteam/kissy/issues/298
                    try {
                        v = decode(v);
                    } catch (e) {
                        log(e + "urlDecode error : " + v);
                    }
                    // need to decode to get data structure in memory
                    uri[key] = v;
                }
            });

            return uri;
        };

    fn.add = fn.set;

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

    Uri.getComponents = memoize(function(uri) {
        uri = uri || location.href;

        var m = uri.match(ruri) || [],
            ret = {};

        each(rinfo, function(index, key) {
            ret[key] = m[index] || "";
        });

        return ret;
    });


    function isValidParamValue(val) {
        var t = typeof val;
        // If the type of val is null, undefined, number, string, boolean, return TRUE.
        return val === null || (t !== "object" && t !== "function");
    }

    var isUri = memoize(function(val) {
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
    });

    /**
     * get/set/remove/add QueryParam
     * uri, args... or args.., uri
     */
    "add get remove set".replace(S.rword, function(name) {
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