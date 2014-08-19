/**
 * an amd loader
 * thanks seajs
 * 尽量减少对seajs代码的修改
 */
(function(S, undefined) {

    var isObject = S.isObject,
        isString = S.isString,
        isArray = S.isArray,
        isFunction = S.isFunction,
        global = S.global,
        noop = S.noop,
        Loader = S.Loader = {},
        data = Loader.data = {};

    var _cid = 0;
    function cid() {
        return _cid++;
    }

    // path
    var DIRNAME_RE = /[^?#]*\//,
        DOT_RE = /\/\.\//g,
        DOUBLE_DOT_RE = /\/[^/]+\/\.\.\//,
        MULTI_SLASH_RE = /([^:/])\/\//g;

    // Extract the directory portion of a path
    // dirname("a/b/c.js?t=123#xx/zz") ==> "a/b/"
    // ref: http://jsperf.com/regex-vs-split/2
    function dirname(path) {
        return path.match(DIRNAME_RE)[0];
    }

    // Canonicalize a path
    // realpath("http://test.com/a//./b/../c") ==> "http://test.com/a/c"
    function realpath(path) {
        // /a/b/./c/./d ==> /a/b/c/d
        path = path.replace(DOT_RE, "/");

        // a//b/c  ==>  a/b/c
        path = path.replace(MULTI_SLASH_RE, "$1/");

        // a/b/c/../../d  ==>  a/b/../d  ==>  a/d
        while (path.match(DOUBLE_DOT_RE)) {
            path = path.replace(DOUBLE_DOT_RE, "/");
        }

        return path;
    }

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


    var PATHS_RE = /^([^/:]+)(\/.+)$/,
        VARS_RE = /{([^{]+)}/g;

    function parseAlias(id) {
        var alias = data.alias;
        return alias && isString(alias[id]) ? alias[id] : id;
    }

    function parsePaths(id) {
        var paths = data.paths,
            m;

        if (paths && (m = id.match(PATHS_RE)) && isString(paths[m[1]])) {
            id = paths[m[1]] + m[2];
        }

        return id;
    }

    function parseVars(id) {
        var vars = data.vars;

        if (vars && id.indexOf("{") > -1) {
            id = id.replace(VARS_RE, function(m, key) {
                return isString(vars[key]) ? vars[key] : m;
            });
        }

        return id;
    }

    function parseMap(uri) {
        var map = data.map,
            ret = uri;

        if (map) {
            for (var i = 0, len = map.length; i < len; i++) {
                var rule = map[i];

                ret = isFunction(rule) ?
                    (rule(uri) || uri) :
                    uri.replace(rule[0], rule[1]);

                // Only apply the first matched rule
                if (ret !== uri) break;
            }
        }

        return ret;
    }


    var ABSOLUTE_RE = /^\/\/.|:\//,
        ROOT_DIR_RE = /^.*?\/\/.*?\//;

    function addBase(id, refUri) {
        var ret,
            first = id.charAt(0);

        // Absolute
        if (ABSOLUTE_RE.test(id)) {
            ret = id;
        }
        // Relative
        else if (first === ".") {
            ret = (refUri ? dirname(refUri) : data.cwd) + id;
        }
        // Root
        else if (first === "/") {
            var m = data.cwd.match(ROOT_DIR_RE);
            ret = m ? m[0] + id.substring(1) : id;
        }
        // Top-level
        else {
            ret = data.base + id;
        }

        if (ret.indexOf("//") === 0) {
            ret = location.protocol + ret;
        }

        return realpath(ret);
    }

    function id2Uri(id, refUri) {
        if (!id) return "";

        id = parseAlias(id);
        id = parsePaths(id);
        id = parseVars(id);
        id = normalize(id);

        var uri = addBase(id, refUri);
        uri = parseMap(uri);

        return uri;
    }

    var doc = document,
        cwd = dirname(location.href),
        scripts = doc.scripts,
        loaderScript = scripts[scripts.length - 1],
        loaderDir = dirname(getScriptAbsoluteSrc(loaderScript) || cwd);

    function getScriptAbsoluteSrc(node) {
        return node.hasAttribute ? // non-IE6/7
            node.src :
            // see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
            node.getAttribute("src", 4);
    }


    /**
     * util-request.js - The utilities for requesting script and style files
     * ref: tests/research/load-js-css/test.html
     */

    var head = doc.head || doc.getElementsByTagName("head")[0] || doc.documentElement,
        baseElement = head.getElementsByTagName("base")[0];

    // 当前正在加载的script
    var currentlyAddingScript,
        interactiveScript,
        IS_CSS_RE = /\.css(?:\?|$)/i,
        isOldWebKit = +navigator.userAgent
            .replace(/.*(?:AppleWebKit|AndroidWebKit)\/(\d+).*/, "$1") < 536;

    function request(url, callback, charset) {
        callback = callback || noop;

        var isCSS = IS_CSS_RE.test(url),
            node = doc.createElement(isCSS ? "link" : "script");

        if (charset) {
            var cs = isFunction(charset) ? charset(url) : charset;
            if (cs) {
                node.charset = cs;
            }
        }

        addOnload(node, callback, isCSS);

        if (isCSS) {
            node.rel = "stylesheet";
            node.href = url;
        }
        else {
            node.async = true;
            node.src = url;
        }

        // For some cache cases in IE 6-8, the script executes IMMEDIATELY after
        // the end of the insert execution, so use `currentlyAddingScript` to
        // hold current node, for deriving url in `define` call
        currentlyAddingScript = node;

        // ref: #185 & http://dev.jquery.com/ticket/2709
        if (baseElement) {
            head.insertBefore(node, baseElement);
        } else {
            head.appendChild(node);
        }

        currentlyAddingScript = null;
    }

    function addOnload(node, callback, isCSS) {
        // 不支持 onload事件
        var supportOnload = "onload" in node;
        // for Old WebKit and Old Firefox
        if (isCSS && (isOldWebKit || !supportOnload)) {
            setTimeout(function() {
              pollCss(node, callback);
            }, 1); // Begin after node insertion
            return;
        }

        var onload = function() {
            // Ensure only run once and handle memory leak in IE
            node.onload = node.onerror = node.onreadystatechange = null;

            if(!isCSS) {
                head.removeChild(node);
            }

            // Dereference the node
            node = null;
            callback();
        };

        if (supportOnload) {
            node.onload = onload;
            node.onerror = function(error) {
                S.log(error, "error", "request " + isCSS ? "css" : "js");
                onload();
            };
        } else {
            node.onreadystatechange = function() {
                if (/loaded|complete/.test(node.readyState)) {
                    onload();
                }
            };
        }
    }

    function pollCss(node, callback) {
        var sheet = node.sheet,
            isLoaded;

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
                // Place callback here to give time for style rendering
                callback();
            } else {
                pollCss(node, callback);
            }
        }, 20);
    }

    function getCurrentScript() {
        // @update
        if (doc.currentScript) {
            return doc.currentScript;
        }
        if (currentlyAddingScript) {
            return currentlyAddingScript;
        }

        // For IE6-9 browsers, the script onload event may not fire right
        // after the script is evaluated. Kris Zyp found that it
        // could query the script nodes and the one that is in "interactive"
        // mode indicates the current script
        // ref: http://goo.gl/JHfFW
        if (interactiveScript && interactiveScript.readyState === "interactive") {
            return interactiveScript;
        }

        var scripts = head.getElementsByTagName("script"),
            script,
            i = scripts.length - 1;

        for (; i >= 0; i--) {
            script = scripts[i];
            if (script.readyState === "interactive") {
                interactiveScript = script;
                return interactiveScript;
            }
        }
    }

    /**
     * module.js - The core of module loader
     */

    var cachedMods = Loader.cache = {},
        anonymousMeta,
        fetchingList = {},
        fetchedList = {},
        callbackList = {};

    var STATUS = Module.STATUS = {
        // 1 - The `module.uri` is being fetched
        FETCHING: 1,
        // 2 - The meta data has been saved to cachedMods
        SAVED: 2,
        // 3 - The `module.dependencies` are being loaded
        LOADING: 3,
        // 4 - The module are ready to execute
        LOADED: 4,
        // 5 - The module is being executed
        EXECUTING: 5,
        // 6 - The `module.exports` is available
        EXECUTED: 6
    };

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
            var mod = this,
                uri = mod.uri,
                ids = mod.dependencies;

            return S.map(ids, function(id) {
                return Module.resolve(id, uri);
            });
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
            var len = mod._remain = uris.length,
                m,
                i = 0;

            // Initialize modules and register waitings
            for (; i < len; i++) {
                m = Module.get(uris[i]);

                if (m.status < STATUS.EXECUTED) {
                    // Maybe duplicate
                    m._waitings[mod.uri] = (m._waitings[mod.uri] || 0) + 1;
                } else {
                    mod._remain--;
                }
            }

            if (mod._remain === 0) {
                mod.onload();
                return;
            }

            for (i = 0; i < len; i++) {
                m = cachedMods[uris[i]];

                // 模块尚未define及加载
                if (m.status < STATUS.FETCHING) {
                    m.fetch();
                }
                // 模块define过
                else if (m.status === STATUS.SAVED) {
                    m.load();
                }
            }

            // Send all requests at last to avoid cache bug in IE6-9. Issues#808
            // for (var requestUri in requestCache) {
            //     if (requestCache.hasOwnProperty(requestUri)) {
            //         requestCache[requestUri]();
            //     }
            // }
        },

        onload: function() {
            var mod = this;
            mod.status = STATUS.LOADED;

            if (mod.callback) {
                mod.callback();
            }

            mod.exec();

            // Notify waiting modules to fire onload
            var waitings = mod._waitings,
                uri,
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

        // exec to get exports
        exec: function() {
            var mod = this;

            // When module is executed, DO NOT execute it again. When module
            // is being executed, just return `module.exports` too, for avoiding
            // circularly calling
            if (mod.status >= STATUS.EXECUTING) {
                return mod.exports;
            }

            mod.status = STATUS.EXECUTING;

            var uri = mod.uri,
                uris = mod.resolve(),
                deps = [],
                i = 0,
                len = uris.length;

            for (; i < len; i++) {
                deps[i] = Module.get(uris[i]).exports;
            }

            // Exec factory
            var factory = mod.factory,
                exports = isFunction(factory) ?
                    factory.apply(null, deps) :
                    factory;

            if (exports === undefined) {
                exports = mod.exports;
            }

            // if (exports === null) {

            // }

            // Reduce memory leak
            delete mod.factory;

            mod.exports = exports;
            mod.status = STATUS.EXECUTED;

            // Emit `exec` event
            // emit("exec", mod)

            return exports;
        },

        fetch: function() {
            var mod = this,
                uri = mod.uri;

            mod.status = STATUS.FETCHING;

            // Empty uri or a non-CMD module
            if (!uri || fetchedList[uri]) {
                mod.load();
                return;
            }

            if (fetchingList[uri]) {
                callbackList[uri].push(mod);
                return;
            }

            fetchingList[uri] = true;
            callbackList[uri] = [mod];


            sendRequest();

            function sendRequest() {
                request(uri, onRequest, data.charset);
            }


            function onRequest() {
                delete fetchingList[uri];
                fetchedList[uri] = true;

                // Save meta data of anonymous module
                if (anonymousMeta) {
                    Module.save(uri, anonymousMeta);
                    anonymousMeta = null;
                }

                // Call callbacks
                var m, mods = callbackList[uri];
                delete callbackList[uri];
                while ((m = mods.shift())) m.load();
            }
        }
    };

    // Save meta data to cachedMods
    Module.save = function(uri, meta) {
        var mod = Module.get(uri);

        // Do NOT override already saved modules
        if (mod.status < STATUS.SAVED) {
            mod.id = meta.id || uri;
            mod.dependencies = meta.deps || [];
            mod.factory = meta.factory;
            mod.status = STATUS.SAVED;
        }
    };

    Module.get = function(uri, deps) {
        return cachedMods[uri] || (cachedMods[uri] = new Module(uri, deps));
    };
    // 不直接调用Module.require, 在其他地方使用并传入uri
    // Use function is equal to load a anonymous module
    Module.require = function(ids, callback, uri) {
        // 匿名模块uri根据preload，require等+cid进行区分
        // 需要uri来创建模块，注册依赖
        var mod = Module.get(uri, isArray(ids) ? ids : [ids]);

        // 注册模块完成时的callback
        // 获取依赖模块的export并且执行callback
        mod.callback = function() {
            var exports = [],
                uris = mod.resolve(),
                i = 0,
                len = uris.length;

            for (; i < len; i++) {
                exports[i] = cachedMods[uris[i]].exports;
            }

            if (callback) {
                callback.apply(global, exports);
            }

            delete mod.callback;
        };

        mod.load();
    };

    // Resolve id to uri
    Module.resolve = function(id, refUri) {
        return id2Uri(id, refUri);
    };

    /**
     * define
     * 匿名模块与非匿名模块
     * 非匿名模块调用module.save保存模块信息。模块状态变为SAVED
     */
    Module.define = function(id, deps, factory) {
        var argsLen = arguments.length;

        // define(factory)
        if (argsLen === 1) {
            factory = id;
            id = undefined;
        } else if (argsLen === 2) {
            factory = deps;

            // define(deps, factory)
            if (isArray(id)) {
                deps = id;
                id = undefined;
            }
            // define(id, factory)
            else {
                deps = undefined;
            }
        }

        if (!isArray(deps)) {
            deps = [];
        }

        var meta = {
            id: id,
            uri: Module.resolve(id),
            deps: deps,
            factory: factory
        };

        // Try to derive uri in IE6-9 for anonymous modules
        if (!meta.uri) {
            var script = getCurrentScript();
            if (script) {
                meta.uri = script.src;
            }

            // NOTE: If the id-deriving methods above is failed, then falls back
            // to use onload event to get the uri
        }

        if (meta.uri) {
            Module.save(meta.uri, meta);
        } else {
            // Save information for "saving" work in the script onload event
            anonymousMeta = meta;
        }
    };

    Module.define.amd = {};

    /**
     * config.js - The configuration for the loader
     */

    // The root path to use for id2uri parsing
    // If loaderUri is `http://test.com/libs/seajs/[??][seajs/1.2.3/]sea.js`, the
    // baseUri should be `http://test.com/libs/`
    // 请求的baseUrl
    data.base = loaderDir;

    // The loader directory
    // loader所在目录，base默认是这个
    data.dir = loaderDir;

    // The current working directory
    data.cwd = cwd;

    // The charset for requesting files
    data.charset = "utf-8";

    // data.alias - An object containing shorthands of module id
    // data.paths - An object containing path shorthands in module id
    // data.vars - The {xxx} variables in module id
    // data.map - An array containing rules to map module uri
    // data.debug - Debug mode. The default value is false

    Loader.config = function(configData) {

        for (var key in configData) {
            var curr = configData[key],
                prev = data[key];

            // Merge object config such as alias, vars
            if (prev && isObject(prev)) {
                for (var k in curr) {
                    prev[k] = curr[k];
                }
            } else {
                // Concat array config such as map, preload
                if (isArray(prev)) {
                    curr = prev.concat(curr);
                }
                // Make sure that `data.base` is an absolute path
                else if (key === "base") {
                    if (curr.slice(-1) !== "/") {
                        curr += "/";
                    }
                    curr = addBase(curr);
                }

                // Set config
                data[key] = curr;
            }
        }
    };


    Loader.resolve = id2Uri;

    global.define = S.define = Module.define;

    S.require = function(ids, callback) {
        Module.require(ids, callback, data.cwd + "_require_" + cid());
        return S;
    };

    S.realpath = realpath;

})(tbtx);
