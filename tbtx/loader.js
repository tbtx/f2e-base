(function(S) {
    // 简单模块定义和加载
    var Loader = S.namespace("Loader"),

        // 缓存计算过的依赖
        dependenciesMap = Loader.dependenciesMap = {},

        modules = Loader.modules = {},

        data = Loader.data = {
            baseUrl: S.staticUrl + "/base/js/component/",
            urlArgs: "2013.12.19.0",
            paths: {

            },

            deps: {
                drop: "overlay",
                popup: "overlay"
            }
        };

    Loader.config = function(val) {
        return $.extend(true, data, val);
    };

    // id 和dependencies 都可选
    // Module ids can be used to identify the module being defined, they are also used in the dependency array argument
    // S.define = function(id, dependencies, factory) {
    //     if (!modules[id]) {
    //         var module = {
    //             id: id,
    //             dependencies: dependencies,
    //             factory: factory
    //         };
    //         modules[id] = module;
    //     }
    //     return modules[id];
    // };

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
                ret =  baseUrl + path;
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
     * 暂时只处理组件之间的依赖
     * 外部的依赖请自行处理
     */
    function getDeps(name) {
        var ret = [],
            i,
            // 依赖配置
            depsConfig = data.deps,
            deps = depsConfig[name];

        // 没有计算过依赖
        if (!dependenciesMap[name]) {
            // 有依赖
            if (deps) {
                // 保证deps为数组
                if (!S.isArray(deps)) {
                    deps = [deps];
                }

                S.each(deps, function(dep) {
                    ret.unshift(dep);
                    ret = getDeps(dep).concat(ret);
                });
            }
            dependenciesMap[name] = ret;
        }
        return dependenciesMap[name];
    }

    // function Module(name) {
    //     this.name = name;
    //     this.deps = getDeps(name);
    //     // 依赖该模块的模块数
    //     this.depsCount = 0;

    //     modules[name] = this;
    // }
    // Module.prototype = {

    // };

    // Module.find = function(name) {
    //     return modules[name] || new Module(name);
    // };
})(tbtx);