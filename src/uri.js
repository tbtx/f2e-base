/**
 * Uri 相关
 */
(function(S, undefined) {

    var each = S.each,
        isArray = S.isArray;

    var EMPTY = "",

        encode = function (s) {
            return encodeURIComponent(String(s));
        },

        decode = function (s) {
            return decodeURIComponent(s.replace(/\+/g, " "));
        },

        param = function(o, sep, eq, serializeArray) {
            sep = sep || "&";
            eq = eq || "=";
            if (serializeArray === undefined) {
                serializeArray = true;
            }
            var buf = [],
                key, i, v, len, val;
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
                            buf.push(key, (serializeArray ? encode("[]") : EMPTY));
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
        unparam = function(str, sep, eq) {
            if (typeof str !== "string" || !(str = str.trim())) {
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
                    if (S.endsWith(key, '[]')) {
                        key = key.substring(0, key.length - 2);
                    }
                }
                if (key in ret) {
                    if (isArray(ret[key])) {
                        ret[key].push(val);
                    } else {
                        ret[key] = [
                            ret[key],
                            val
                        ];
                    }
                } else {
                    ret[key] = val;
                }
            }
            return ret;
        };

    var Query = S.Query = function(query) {
        this._query = query || EMPTY;
        this._queryMap = unparam(this._query);
    };

    Query.prototype = {
        /**
         * Return parameter value corresponding to current key
         * @param {String} [key]
         */
        get: function (key) {
            var _queryMap = this._queryMap;
            return key ? _queryMap[key] : _queryMap;
        },

        /**
         * Set parameter value corresponding to current key
         * @param {String} key
         * @param value
         * @chainable
         */
        set: function (key, value) {
            var self = this,
                _queryMap = self._queryMap;

            if (typeof key === "string") {
                self._queryMap[key] = value;
            } else {
                if (key instanceof Query) {
                    key = key.get();
                }
                each(key, function (v, k) {
                    _queryMap[k] = v;
                });
            }
            return self;
        },

        /**
         * Remove parameter with specified name.
         * @param {String} key
         * @chainable
         */
        remove: function (key) {
            var self = this;

            if (key) {
                delete self._queryMap[key];
            } else {
                self._queryMap = {};
            }
            return self;
        },

        /**
         * Add parameter value corresponding to current key
         * @param {String} key
         * @param value
         * @chainable
         */
        add: function (key, value) {
            var self = this,
                _queryMap = self._queryMap,
                currentValue;
            if (typeof key === "string") {
                currentValue = _queryMap[key];
                if (currentValue === undefined) {
                    currentValue = value;
                } else {
                    currentValue = [].concat(currentValue).concat(value);
                }
                _queryMap[key] = currentValue;
            } else {
                if (key instanceof Query) {
                    key = key.get();
                }

                each(key, function(v, k) {
                    self.add(k, v);
                });
            }
            return self;
        },

        /**
         * Serialize query to string.
         * @param {Boolean} [serializeArray=true]
         * whether append [] to key name when value 's type is array
         */
        toString: function (serializeArray) {
            return param(this._queryMap, undefined, undefined, serializeArray);
        }
    };


    // from caja uri
    var RE_URI = new RegExp(
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
        var components,
            self = this;

        uriStr = uriStr || defaultUri;

        S.keys(REG_INFO).forEach(function(item) {
            self[item] = EMPTY;
        });

        components = Uri.getComponents(uriStr);

        each(components, function (v, key) {
            if (key === "query") {
                // need encoded content
                self.query = new Query(v);
            } else {
                // https://github.com/kissyteam/kissy/issues/298
                try {
                    v = decode(v);
                } catch (e) {
                    S.log(e + "urlDecode error : " + v, "error", "Uri");
                }
                // need to decode to get data structure in memory
                self[key] = v;
            }
        });

        return self;
    };

    Uri.prototype = {

        getFragment: function () {
            return this.fragment;
        },

        toString: function (serializeArray) {
            var out = [],
                self = this,
                scheme = self.scheme,
                domain = self.domain,
                path = self.path,
                port = self.port,
                fragment = self.fragment,
                query = self.query.toString(serializeArray),
                credentials = self.credentials;

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

    Uri.getComponents = function (url) {
        url = url || EMPTY;

        var m = url.match(RE_URI) || [],
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

    S.mix({
        urlEncode: encode,
        urlDecode: decode,
        param: param,
        unparam: unparam,

        isUri: function(val) {
            if (S.isNotEmptyString(val)) {
                var match = RE_URI.exec(val);
                return match && match[1];
            }
            return false;
        },

        parseUri: function(uri) {
            return Uri.getComponents(uri || defaultUri);
        },

        getFragment: function(uri) {
            return new Uri(uri).getFragment();
        },

        /**
         * name, url or
         * url, name
         */
        getQueryParam: function(name, uri) {
            if (S.isUri(name)) {
                // swap
                name = [uri, uri = name][0];
            }

            uri = new Uri(uri);
            return uri.query.get(name) || EMPTY;
        },

        /**
         * name, value, url
         * {}, url
         */
        addQueryParam: function(name, value, uri) {
            var params = {};

            if (S.isPlainObject(name)) {
                params = name;
                uri = value;
            } else {
                params[name] = value;
            }

            uri = new Uri(uri);
            uri.query.add(params);

            return uri.toString();
        },

        removeQueryParam: function(names, uri) {
            names = S.makeArray(names);
            uri = new Uri(uri);

            names.forEach(function(item) {
                uri.query.remove(item);
            });
            return uri.toString();
        }
    });

    // 兼容之前的API
    S.parseUrl = S.parseUri;

})(tbtx);