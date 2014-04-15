(function(S) {

var noop = S.noop,
    isArray = S.isArray,
    isString = S.isString,
    isFunction = S.isFunction,
    isObject = S.isObject,
    global = S.global;

var Loader = S.Loader = {},
    data = Loader.data = {},
    cid = S.generateCid();

var DIRNAME_RE = /[^?#]*\//;
// Extract the directory portion of a path
// dirname("a/b/c.js?t=123#xx/zz") ==> "a/b/"
// ref: http://jsperf.com/regex-vs-split/2
var dirname = function(path) {
    return path.match(DIRNAME_RE)[0];
};

var DOT_RE = /\/\.\//g;
var DOUBLE_DOT_RE = /\/[^/]+\/\.\.\//;
var DOUBLE_SLASH_RE = /([^:/])\/\//g;

// Canonicalize a path
// realpath("http://test.com/a//./b/../c") ==> "http://test.com/a/c"
var realpath = function(path) {
    // /a/b/./c/./d ==> /a/b/c/d
    path = path.replace(DOT_RE, "/");

    // a/b/c/../../d  ==>  a/b/../d  ==>  a/d
    while (path.match(DOUBLE_DOT_RE)) {
        path = path.replace(DOUBLE_DOT_RE, "/");
    }

    path = path.replace(DOUBLE_SLASH_RE, "$1/");

    return path;
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


var PATHS_RE = /^([^/:]+)(\/.+)$/;
var VARS_RE = /{([^{]+)}/g;

function parseAlias(id) {
    var alias = data.alias;
    return alias && isString(alias[id]) ? alias[id] : id;
}

function parsePaths(id) {
    var paths = data.paths;
    var m;

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
    var map = data.map;
    var ret = uri;

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


var ABSOLUTE_RE = /^\/\/.|:\//;
var ROOT_DIR_RE = /^.*?\/\/.*?\//;

function addBase(id, refUri) {
    var ret;
    var first = id.charAt(0);

    // Absolute
    if (ABSOLUTE_RE.test(id)) {
        ret = id;
    }
    // Relative
    else if (first === ".") {
        ret = realpath((refUri ? dirname(refUri) : data.cwd) + id);
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

    return ret;
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

var doc = document;
var cwd = dirname(location.href);

// tbtx.js 的完整路径
var loaderScriptSrc = (function() {
    if(doc.currentScript){
        return getScriptAbsoluteSrc(doc.currentScript);
    }
    var scripts = doc.scripts,
        node,
        src,
        length = scripts.length,
        i = length - 1,
        pattern = /tbtx\.(min\.)?js/;

    for (; i >= 0; i--) {
        node = scripts[i];
        src = getScriptAbsoluteSrc(node);

        if (node.readyState === "interactive") {
            return src;
        }
        if (src && pattern.test(src)) {
            return src;
        }
    }

    // return getScriptAbsoluteSrc(scripts[length - 1]);
})();

var loaderDir = dirname(loaderScriptSrc);

var staticUrl = S.staticUrl = realpath(loaderDir + "../../");


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

var head = doc.head || doc.getElementsByTagName("head")[0] || doc.documentElement;
var baseElement = head.getElementsByTagName("base")[0];

var currentlyAddingScript;
var interactiveScript;

var promiseMap = {};
function request(url, callback, charset) {

    var promise = promiseMap[url];
    if (promise) {
        promise.then(callback);
        return promise;
    }

    var node = doc.createElement("script");

    if (charset) {
        var cs = isFunction(charset) ? charset(url) : charset;
        if (cs) {
            node.charset = cs;
        }
    }

    promise = promiseMap[url] = new Promise(function(resolve, reject) {
        addOnload(node, resolve);
    });
    promise.then(callback);

    node.async = true;
    node.src = url;

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
    return promise;
}

function addOnload(node, callback) {
    var supportOnload = "onload" in node;

    var onload = function() {
        // Ensure only run once and handle memory leak in IE
        node.onload = node.onerror = node.onreadystatechange = null;

        head.removeChild(node);

        // Dereference the node
        node = null;
        callback();
    };

    if (supportOnload) {
        node.onload = onload;
        node.onerror = function(error) {
            S.log("loadScript error", "error");
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

var SCHEME_RE = /^(http|file)/i;
/**
 * 请求的相对url转为绝对
 * @param  {string} url
 * @return {string} normalizedUrl
 */
function normalizeUrl(url) {
    if (!SCHEME_RE.test(url)) {
        url = staticUrl + url;
    }
    return url;
}

S.loadCss = function(url) {
    url = normalizeUrl(url);

    var node = doc.createElement("link");
    node.rel = "stylesheet";
    node.href = url;
    if (baseElement) {
        head.insertBefore(node, baseElement);
    } else {
        head.appendChild(node);
    }
};

S.loadScript = function(url, callback, charset) {
    // url传入数组，按照数组中脚本的顺序进行加载
    if (isArray(url)) {
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
};

function getCurrentScript() {
    if(doc.currentScript){
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

    var scripts = head.getElementsByTagName("script");

    for (var i = scripts.length - 1; i >= 0; i--) {
        var script = scripts[i];
        if (script.readyState === "interactive") {
            interactiveScript = script;
            return interactiveScript;
        }
    }
}

/**
 * module.js - The core of module loader
 */

var cachedMods = Loader.cache = {};
var anonymousMeta;

var fetchingList = {};
var fetchedList = {};
var callbackList = {};

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
        var mod = this;
        var ids = mod.dependencies;

        return S.map(ids, function(id) {
            return Module.resolve(id, mod.uri);
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
        var len = mod._remain = uris.length;
        var m;

        // Initialize modules and register waitings
        for (var i = 0; i < len; i++) {
            m = Module.get(uris[i]);

            // AMD依赖的模块需要执行完成
            if (m.status < STATUS.EXECUTED) {
                // Maybe duplicate
                m._waitings[mod.uri] = (m._waitings[mod.uri] || 0) + 1;
            }
            else {
                mod._remain--;
            }
        }

        if (mod._remain === 0) {
            mod.onload();
            return;
        }

        for (i = 0; i < len; i++) {
            m = cachedMods[uris[i]];

            if (m.status < STATUS.FETCHING) {
                m.fetch();
            }
            else if (m.status === STATUS.SAVED) {
                m.load();
            }
        }
    },

    onload: function() {
        var mod = this;
        mod.status = STATUS.LOADED;
        if (mod.callback) {
            mod.callback();
        }


        mod.exec();
        // Notify waiting modules to fire onload
        var waitings = mod._waitings;
        var uri, m;

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
    exec: function () {
        var mod = this;

        // When module is executed, DO NOT execute it again. When module
        // is being executed, just return `module.exports` too, for avoiding
        // circularly calling
        if (mod.status >= STATUS.EXECUTING) {
            return mod.exports;
        }

        mod.status = STATUS.EXECUTING;
        var uri = mod.uri;

        var uris = mod.resolve();
        var deps = [];
        for (var i = 0, len = uris.length; i < len; i++) {
            deps[i] = Module.get(uris[i]).exports;
        }

        // Exec factory
        var factory = mod.factory;

        var exports;
        try {
        exports = isFunction(factory) ?
          factory.apply(null, deps) :
          factory;
        } catch(err) {
            S.log("factory error:").log(err, "error");
        }
        // if (exports === undefined) {
        //     exports = mod.exports;
        // }

        // if (exports === null && !IS_CSS_RE.test(uri)) {
            // emit("error", mod)
        // }

        // Reduce memory leak
        delete mod.factory;

        mod.exports = exports;
        mod.status = STATUS.EXECUTED;

        // Emit `exec` event
        // emit("exec", mod)

        return exports;
    },

    fetch: function(requestCache) {
        var mod = this;
        var uri = mod.uri;

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

Module.get = function(uri, deps) {
    return cachedMods[uri] || (cachedMods[uri] = new Module(uri, deps));
};
// 不直接调用Module.require, 在其他地方使用并传入uri
// Use function is equal to load a anonymous module
Module.require = function (ids, uri, callback) {
    // 匿名模块uri根据preload，require等+cid进行区分
    // 需要uri来创建模块，注册依赖
    var mod = Module.get(uri, isArray(ids) ? ids : [ids]);

    var promise = new Promise(function(resolve, reject) {
        mod.callback = function() {
            var exports = [];
            var uris = mod.resolve();

            for (var i = 0, len = uris.length; i < len; i++) {
                exports[i] = cachedMods[uris[i]].exports;
            }
            if (callback) {
                try {
                    callback.apply(global, exports);
                } catch (err) {
                    S.log("require callback error:").log(err, "error");
                }
            }
            resolve();
            delete mod.callback;
        };
    });

    mod.load();
    return promise;
};

// Resolve id to uri
Module.resolve = function(id, refUri) {
    return id2Uri(id, refUri);
};

Module.define = function(id, deps, factory) {
    var argsLen = arguments.length;

    // define(factory)
    if (argsLen === 1) {
        factory = id;
        id = undefined;
    }
    else if (argsLen === 2) {
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
    // && doc.attachEvent
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
        anonymousMeta = meta;
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

// data.preload = [];

// data.alias - An object containing shorthands of module id
// data.paths - An object containing path shorthands in module id
// data.vars - The {xxx} variables in module id
// data.map - An array containing rules to map module uri
// data.debug - Debug mode. The default value is false

Loader.config = function(configData) {

    for (var key in configData) {
        var curr = configData[key];
        var prev = data[key];

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
                if (curr.slice(-1) != "/") {
                    curr += "/";
                }
                curr = addBase(curr);
            }

            // Set config
            data[key] = curr;
        }
    }

    return Loader;
};

var componentDir = loaderDir + "component/";
Loader.config({
    base: componentDir,
    cwd: componentDir,

    alias: {
        "jquery": "jquery/jquery-1.8.3.min.js",
        "handlebars": "gallery/handlebars/1.3.0/handlebars.js",
        "easing": "plugin/jquery.easing.1.3.js"
    },

    paths: {
        base: "../../",
        maijia: '../../../maijia',
        miiee: '../../../miiee',

        plugin: '../plugin',
        gallery: '../gallery',
        jquery: '../jquery'
    }
});

S.mix({
    realpath: realpath
});

S.require = function(ids, callback) {
    return Module.require(ids, data.cwd + "_require_" + cid(), callback);
};
S.define = Module.define;

global.define = global.define || Module.define;

})(tbtx);
