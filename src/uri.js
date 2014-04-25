(function(S, undefined) {

    var TRUE = true,
        FALSE = false,
        EMPTY = "",
        each = S.each,
        param = S.param,
        unparam = S.unparam;

    var urlEncode = function (s) {
            return encodeURIComponent(String(s));
        },
        urlDecode = function (s) {
            return decodeURIComponent(s.replace(/\+/g, " "));
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
            if (key) {
                return _queryMap[key];
            } else {
                return S.deepCopy(_queryMap);
            }
        },

        /**
         * Parameter names.
         * @return {String[]}
         */
        keys: function () {
            return S.keys(this._queryMap);
        },

        /**
         * Set parameter value corresponding to current key
         * @param {String} key
         * @param value
         * @chainable
         */
        set: function (key, value) {
            var _queryMap = this._queryMap;
            if (typeof key === "string") {
                this._queryMap[key] = value;
            } else {
                if (key instanceof Query) {
                    key = key.get();
                }
                each(key, function (v, k) {
                    _queryMap[k] = v;
                });
            }
            return this;
        },

        /**
         * Remove parameter with specified name.
         * @param {String} key
         * @chainable
         */
        remove: function (key) {
            if (key) {
                delete this._queryMap[key];
            } else {
                this._queryMap = {};
            }
            return this;

        },

        /**
         * Add parameter value corresponding to current key
         * @param {String} key
         * @param value
         * @chainable
         */
        add: function (key, value) {
            var _queryMap = this._queryMap,
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
                for (var k in key) {
                    this.add(k, key[k]);
                }
            }
            return this;
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
    var URI_RE = new RegExp(
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
        };

    var Uri = S.Uri = function(uriStr) {
        var components,
            self = this;

        S.mix(self, {
            scheme: EMPTY,
            credentials: EMPTY,
            domain: EMPTY,
            port: EMPTY,
            path: EMPTY,
            query: EMPTY,
            fragment: EMPTY
        });

        components = Uri.getComponents(uriStr);

        each(components, function (v, key) {
            if (key === "query") {
                // need encoded content
                self.query = new Query(v);
            } else {
                // https://github.com/kissyteam/kissy/issues/298
                try {
                    v = urlDecode(v);
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

                out.push(encodeURIComponent(domain));

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
        url = url || location.href;

        var m,
            ret = {};

        if (!S.isNotEmptyString(url)) {
            return ret;
        }

        m = url.match(URI_RE) || [];

        each(REG_INFO, function(index, key) {
            ret[key] = m[index] || EMPTY;
        });
        return ret;
    };

    S.mix({
        urlEncode: urlEncode,
        urlDecode: urlDecode,

        isUri: function(val) {
            var match;
            if (S.isNotEmptyString(val)) {
                match = URI_RE.exec(val);
                return match && match[1];
            }
            return FALSE;
        },

        parseUrl: Uri.getComponents,

        getFragment: function(url) {
            return new Uri(url).getFragment();
        },
        getQueryParam: function(name, url) {
            if (S.isUri(name)) {
                url = name;
                name = EMPTY;
            }
            var uri = new Uri(url);
            return uri.query.get(name) || EMPTY;
        },
        addQueryParam: function(name, value, url) {
            var input = {};
            if (S.isPlainObject(name)) {
                url = value;
                input = name;
            } else {
                input[name] = value;
            }
            var uri = new Uri(url);
            uri.query.add(input);

            return uri.toString();
        },
        removeQueryParam: function(name, url) {
            name = S.makeArray(name);
            var uri = new Uri(url);

            name.forEach(function(item) {
                uri.query.remove(item);
            });
            return uri.toString();
        }

    });

})(tbtx);