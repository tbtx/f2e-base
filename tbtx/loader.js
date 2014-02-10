(function(S) {
    // 简单模块定义和加载
    // 按seajs风格写
    var Loader = S.namespace("Loader"),

        global = S.global,

        data = Loader.data = {

            baseUrl: S.staticUrl + "base/js/component/",

            // baseUrl: "http://static.tianxia.taobao.com/tbtx/" + "base/js/component/",

            // urlArgs: "2013.12.19.0",

            alias: {
                "handlebars": "miiee/handlebars.js",
                "easing": "plugin/jquery.easing.1.3.js"
            },

            paths: {
                miiee: '../../../miiee/js',
                plugin: '../plugin',
                gallery: '../gallery'
            },

            deps: {
                drop: "overlay",
                popup: "overlay",
                tip: "drop",
                templatable: "handlebars",
                autocomplete: ["overlay", "templatable"],
                switchable: "easing"
            },

            exports: {
                handlebars: "Handlebars"
            }
        };

    Loader.config = function(configData) {
        for (var key in configData) {
            var curr = configData[key];
            var prev = data[key];

            // Merge object config such as alias, vars
            if (prev && S.isObject(prev)) {
                for (var k in curr) {
                    prev[k] = curr[k];
                }
            } else {
                // Concat array config such as map, preload
                if (S.isArray(prev)) {
                    curr = prev.concat(curr);
                }
                // Make sure that `data.base` is an absolute path
                else if (key === "base") {
                    var dummy = (curr.slice(-1) === "/") || (curr += "/");
                    curr = addBase(curr);
                }

                // Set config
                data[key] = curr;
            }
        }
    };

    // Normalize an id
    // normalize("path/to/a") ==> "path/to/a.js"
    // NOTICE: substring is faster than negative slice and RegExp
    function normalize(path) {
        var last = path.length - 1;
        var lastC = path.charAt(last);

        // If the uri ends with `#`, just return it without '#'
        if (lastC === "#") {
            return path.substring(0, last);
        }

        return (path.substring(last - 2) === ".js" ||
            path.indexOf("?") > 0 ||
            path.substring(last - 3) === ".css" ||
            lastC === "/") ? path : path + ".js";
    }

    function parseAlias(id) {
        var alias = data.alias;
        return alias && S.isString(alias[id]) ? alias[id] : id;
    }

    var PATHS_RE = /^([^/:]+)(\/.+)$/;
    function parsePaths(id) {
        var paths = data.paths;
        var m;

        if (paths && (m = id.match(PATHS_RE)) && S.isString(paths[m[1]])) {
            id = paths[m[1]] + m[2];
        }

        return id;
    }
    function addBase(id) {
        return data.baseUrl + id;
    }
    function id2Uri(id) {
        if (!id) {
            return "";
        }
        id = parseAlias(id);
        id = parsePaths(id);
        id = normalize(id);

        var uri = addBase(id);

        return S.realpath(uri);
    }

    function Module(uri, deps) {
        this.uri = uri;
        this.dependencies = deps || [];
        this.exports = null;
        this.status = 0;

        // Who depends on me
        this._waitings = {};

        // The number of unloaded dependencies
        // 未加载的依赖数
        this._remain = 0;
    }

    Module.prototype = {
        // Resolve module.dependencies
        // 返回依赖模块的uri数组
        resolve: function() {
            var mod = this;
            var ids = mod.dependencies;

            var uris = S.map(ids, function(id) {
                return Module.resolve(id);
            });

            return uris;
        },

        // component模块需要去服务器请求
        // require模块不需要，没有fetching状态
        isToFetch: function() {
            var mod = this;
            return !S.startsWith(mod.uri, requirePrefix);
        },

        // 从tbtx.Popup之类解析出exports
        parseExports: function() {
            var mod = this;
            var id = uriToId[mod.uri];

            // 默认exports 为tbtx.xxx, xxx首字母大写
            var target = data.exports[id] || "tbtx." + S.ucfirst(id);
            target = target.split(".");

            var ret = global;
            while(target.length) {
                ret = ret[target.shift()];
            }
            mod.exports = ret || null;
        },

        // Load module.dependencies and fire onload when all done
        load: function() {
            var mod = this;

            // If the module is being loaded, just wait it onload call
            if (mod.status >= STATUS.LOADING) {
                return;
            }

            mod.status = STATUS.LOADING;

            var uris = mod.resolve();

            // 未加载的依赖数
            var len = mod._remain = uris.length;
            var m;

            // Initialize modules and register waitings
            S.each(uris, function(uri) {
                m = Module.get(uri);

                if (m.status < STATUS.LOADED) {
                    // Maybe duplicate
                    m._waitings[mod.uri] = (m._waitings[mod.uri] || 0) + 1;
                } else {
                    mod._remain--;
                }
            });

            if (mod._remain === 0) {
                mod.onload();
                return;
            }

            S.each(uris, function(uri) {
                m = cachedMods[uri];

                if (m.status < STATUS.LOADING) {
                    // S.log(m.uri + " load");
                    m.load();
                }
            });
        },

        onload: function() {
            var mod = this;

            // 如果是component模块，依赖加载完成之后需要加载自身
            if (mod.status < STATUS.FETCHING && mod.isToFetch()) {
                mod.fetch();
                return;
            }

            // if (mod.status == STATUS.LOADED) {
            //     return;
            // }

            // S.log("mod " + this.uri + " onload");
            mod.status = STATUS.LOADED;

            if (mod.callback) {
                mod.callback();
            }

            // Notify waiting modules to fire onload
            var waitings = mod._waitings;
            var uri,
                m;

            for (uri in waitings) {
                if (waitings.hasOwnProperty(uri)) {
                    m = cachedMods[uri];
                    m._remain -= waitings[uri];
                    if (m._remain === 0) {
                        m.onload();
                    }
                }
            }

            // Reduce memory taken
            delete mod._waitings;
            delete mod._remain;
        },


        fetch: function() {
            // S.log("mod " + this.uri + " fetch");
            var mod = this;
            var uri = mod.uri;

            mod.status = STATUS.FETCHING;

            var requestUri = uri;
            // S.log(requestUri + " requestUri");

            if (fetchingList[requestUri]) {
                callbackList[requestUri].push(mod);
                return;
            }

            fetchingList[requestUri] = true;
            callbackList[requestUri] = [mod];


            sendRequest();

            function sendRequest() {
                S.loadScript(requestUri, onRequest, data.charset);
            }

            function onRequest() {
                delete fetchingList[requestUri];
                fetchedList[requestUri] = true;

                mod.parseExports();
                mod.onload();

                // Call callbacks
                var m,
                    mods = callbackList[requestUri];
                delete callbackList[requestUri];
                while ((m = mods.shift())) {
                    m.onload();
                }
            }
        }
    };

    var cachedMods = Loader.cache = {};

    var fetchingList = {};
    var fetchedList = {};
    var callbackList = {};
    var STATUS = Module.STATUS = {
        // 1 - The `module.dependencies` are being loaded
        LOADING: 1,
        // 2 - The `module.uri` is being fetched
        FETCHING: 2,
        // 3 - The module are loaded
        LOADED: 3
    };

    var uriToId = {};
    // Resolve id to uri
    Module.resolve = function(id) {
        var uri = id2Uri(id);
        uriToId[uri] = id;
        return uri;
    };

    Module.get = function(uri, deps) {
        var id = uriToId[uri] || "";
        return cachedMods[uri] || (cachedMods[uri] = new Module(uri, deps || S.makeArray(data.deps[id])));
    };
    Module.require = function(ids, callback, uri) {

        var mod = Module.get(uri, S.makeArray(ids));

        var deferred = S.$.Deferred();

        // 注册模块完成时的callback
        // 获取依赖模块的export并且执行callback
        mod.callback = function() {
            // S.log(mod);
            var uris = mod.resolve();
            var exports = S.map(uris, function(uri) {
                return cachedMods[uri].exports;
            });

            if (callback) {
                callback.apply(global, exports);
            }

            deferred.resolve();
            delete mod.callback;
        };

        mod.load();

        return deferred.promise();
    };

    var cidCounter = 0;
    function cid() {
        return cidCounter++;
    }

    var requirePrefix = "require_";
    S.require = function(ids, callback) {
        return Module.require(ids, callback,  requirePrefix + cid());
    };
})(tbtx);
