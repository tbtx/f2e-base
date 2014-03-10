(function(S) {
    var noop = S.noop;

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

    // 存储每个url的promise对象
    var promiseMap = {};

    function request(url, callback, charset) {
        // 去掉script的url参数
        // if (url.indexOf("?") > -1) {
        //     url = url.split("?")[0];
        // }
        // 该url已经请求过，直接done
        var promise = promiseMap[url];
        if (promise) {
            return promise.then(callback);
        }

        var isCSS = IS_CSS_RE.test(url);
        var node = doc.createElement(isCSS ? "link" : "script");

        if (charset) {
            var cs = S.isFunction(charset) ? charset(url) : charset;
            if (cs) {
                node.charset = cs;
            }
        }

        promise = promiseMap[url] = new Promise(function(resolve, reject) {
            addOnload(node, resolve, isCSS);
        });
        promise.then(callback);

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

        return promise;
    }

    function addOnload(node, callback, isCSS) {
        // 不支持 onload事件
        var missingOnload = isCSS && (isOldWebKit || !("onload" in node));

        // for Old WebKit and Old Firefox
        if (missingOnload) {
            setTimeout(function() {
                pollCss(node, callback);
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


                // deferredMap[url].resolve();

                // alert("resolve");
                callback();
            }
        };
    }

    function pollCss(node, callback) {
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
                // deferredMap[url].resolve();
                // Place callback here to give time for style rendering
                callback();
            } else {
                pollCss(node, callback);
            }
        }, 20);
    }

    var SCHEME_RE = /^(http|file)/i;
    /**
     * 请求的相对url转为绝对
     * @param  {string} url
     * @return {string} normalizedUrl
     */
    function normalizeUrl(url) {
        if (!SCHEME_RE.test(url)) {
            url = S.staticUrl + url;
        }
        return url;
    }

    function loadCss(url, callback, charset) {
        url = normalizeUrl(url);
        return request(url, callback, charset);
    }

    function loadScript(url, callback, charset) {
        // url传入数组，按照数组中脚本的顺序进行加载
        if (S.isArray(url)) {
            var chain,
                length = url.length;

            url = S.map(url, function(item) {
                return normalizeUrl(item);
            });

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

    // 获取脚本的绝对url
    function getScriptAbsoluteSrc(node) {
        return node.hasAttribute ? // non-IE6/7
            node.src :
            // see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
            node.getAttribute("src", 4);
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

    var DOT_RE = /\/\.\//g;
    var DOUBLE_DOT_RE = /\/[^/]+\/\.\.\//;

    // Canonicalize a path
    // realpath("http://test.com/a//./b/../c") ==> "http://test.com/a/c"
    function realpath(path) {
        // /a/b/./c/./d ==> /a/b/c/d
        path = path.replace(DOT_RE, "/");

        // a/b/c/../../d  ==>  a/b/../d  ==>  a/d
        while (path.match(DOUBLE_DOT_RE)) {
            path = path.replace(DOUBLE_DOT_RE, "/");
        }

        return path;
    }

    // file:///E:/tbcdn or cdn(如a.tbcdn.cn/apps/tbtx)
    // 使用tbtx所在script获取到staticUrl
    // 除非脚本名不是tbtx.js or tbtx.min.js，使用默认的staticUrl
    var loaderSrc = getLoaderSrc();
    if (loaderSrc) {
        // delete base js tbtx.js
        S.staticUrl = realpath(loaderSrc + "/../../../");
    }

    S.mix({
        realpath: realpath,
        loadCss: loadCss,
        loadScript: loadScript
    });
})(tbtx);

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
                "jquery": "jquery/jquery-1.8.3.min.js",
                "handlebars": "miiee/handlebars.js",
                "easing": "plugin/jquery.easing.1.3.js"
            },

            paths: {
                miiee: '../../../miiee/js',
                plugin: '../plugin',
                gallery: '../gallery',
                jquery: '../jquery'
            },

            deps: {
                drop: "overlay",
                popup: "overlay",
                tip: "drop",
                templatable: "handlebars",
                autocomplete: ["overlay", "templatable"]
                // switchable 如果想要easing效果需要自己require
                // switchable: "easing"
            },

            exports: {
                // handlebars: "Handlebars"
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
        // parseExports: function() {
        //     var mod = this;
        //     var uri = mod.uri;
        //     var id = uriToId[uri];

        //     // 只解析component或者配置过export的模块
        //     if (uri.indexOf("base/js/component") === -1 || !data.exports[id]) {
        //         return;
        //     }

        //     // 默认exports 为tbtx.xxx, xxx首字母大写
        //     var target = data.exports[id] || "tbtx." + S.ucfirst(id);
        //     target = target.split(".");

        //     var ret = global;
        //     while(target.length) {
        //         ret = ret[target.shift()];
        //     }
        //     mod.exports = ret || null;
        // },

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

                // mod.parseExports();
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

        var promise = new Promise(function(resolve, reject) {
            // 注册模块完成时的callback
            // 获取依赖模块的export并且执行callback
            mod.callback = function() {

                // var uris = mod.resolve();
                // var exports = S.map(uris, function(uri) {
                //     return cachedMods[uri].exports;
                // });

                if (callback) {
                    callback.apply(global);
                }

                resolve();
                delete mod.callback;
            };

        });

        mod.load();

        return promise;
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
