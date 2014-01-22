(function(S) {
    // 简单模块定义和加载
    var Loader = S.namespace("Loader"),

        // 缓存计算过的依赖
        dependenciesCache = Loader.dependenciesCache = new S.Cache("Loader:dependencies"),

        data = Loader.data = {
            baseUrl: S.staticUrl + "/base/js/component/",
            urlArgs: "2013.12.19.0",
            paths: {
                "handlebars": S.staticUrl + "/miiee/js/handlebars.js"
            },

            deps: {
                // 修正页面JS已引入的状态
                drop: "overlay",
                popup: "overlay",
                tip: "drop",
                templatable: "handlebars",
                autocomplete: ["overlay", "templatable"]
            },

            exports: {}
        };

    Loader.config = function(val) {
        return $.extend(true, data, val);
    };

    S.require = function(names, callback, baseUrl) {
        baseUrl = baseUrl || data.baseUrl;
        callback = callback || S.noop;

        if (!S.isArray(names)) {
            names = [names];
        }

        // 获取各个的依赖，将依赖最多的排在前面来进行unique
        var deps = sortDeps(names);

        // 加上自身，unique
        deps = deps.concat(names);
        deps = S.unique(deps);

        var scripts = getScripts(deps, baseUrl);
        return S.loadScript(scripts, callback);
    };

    function getScripts(deps, baseUrl) {
        var paths = data.paths;
        return S.map(deps, function(item) {
            var path = paths[item] || item,
                ret =  S.isUri(path) ? path : baseUrl + path;
            if (!S.endsWith(ret, ".js")) {
                ret += ".js";
            }
            ret += "?" + data.urlArgs;
            return ret;
        });
    }

    function sortDeps(names) {
        var depsSorted = [];
        S.each(names, function(name) {
            depsSorted.push(getDeps(name));
        });
        depsSorted.sort(function(v1, v2) {
            return v1.length < v2.length;
        });
        return S.reduce(depsSorted, function(prev, now) {
            return prev.concat(now);
        });
    }
    /*
     * 获取模块依赖
     */
    function getDeps(name) {
        var ret = [],
            i,
            // 依赖配置
            depsConfig = data.deps,
            pathsConfig = data.paths,
            context,
            exp,    // export
            deps = depsConfig[name];

        // 没有计算过依赖
        if (!dependenciesCache.get(name)) {
            // 有依赖
            if (deps) {
                // 保证deps为数组
                if (!S.isArray(deps)) {
                    deps = [deps];
                }

                S.each(deps, function(dep) {
                    // 比如请求overlay，先判断是否有S.Overlay，也就是页面已经引入了JS的情况
                    // handlebars之类的使用global.Hanlebars
                    if (S.isUri(pathsConfig[dep])) {
                        context = S.global;
                    } else {
                        context = S;
                    }
                    // 是否已经载入过
                    exp = context[S.ucfirst(dep)];
                    if (!exp) {
                        ret.unshift(dep);
                        ret = getDeps(dep).concat(ret);
                    }
                });
            }
            dependenciesCache.set(name, ret);
        }
        return dependenciesCache.get(name);
    }
})(tbtx);