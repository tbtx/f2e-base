(function(S) {
    // 简单模块定义和加载
    var noop = S.noop,
        isArray = S.isArray,
        each = S.each,
        unique = S.unique,
        indexOf = S.indexOf;

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
    S.define = function(id, dependencies, factory) {
        if (!modules[id]) {
            var module = {
                id: id,
                dependencies: dependencies,
                factory: factory
            };
            modules[id] = module;
        }
        return modules[id];
    };

    function error(val) {
        var msg = typeof val !== 'object' ? 'Uncaught error while run ' + error.caller : 'Call ' + val.fn + '() error, ' + val.msg;
        throw new Error(msg);
    }

    S.require = function(names, callback, baseUrl) {
        baseUrl = baseUrl || data.baseUrl;
        callback = callback || noop;

        if (!isArray(names)) {
            names = [names];
        }

        // 获取各个的依赖，将依赖最多的排在前面来进行unique
        var deps = sortDeps(names);

        // 加上自身，unique
        deps = deps.concat(names);
        deps = unique(deps);

        var scripts = getScripts(deps, baseUrl);
        return S.loadScript(scripts, callback);
    };

    function getScripts(deps, baseUrl) {
        return S.map(deps, function(item) {
            var path = data.paths[item] || item,
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
        each(names, function(name) {
            depsSorted.push(getDeps(name));
        });
        depsSorted.sort(function(v1, v2) {
            return v1.length < v2.length;
        });

        var ret = [];
        each(depsSorted, function(item) {
            ret = ret.concat(item);
        });
        return ret;
    }
    /*
     * 获取模块依赖
     * 暂时只处理组件之间的依赖
     * 外部的依赖请自行处理
     */
    function getDeps(name) {
        var ret = [],
            i,
            j,
            // 依赖配置
            depsConfig = data.deps,
            deps = depsConfig[name],
            dep,
            anotherDeps,
            anotherDep;

        if (dependenciesMap[name]) {
            return dependenciesMap[name];
        }

        if (!deps) {
            return ret;
        }
        // 保证deps为数组
        if (!isArray(deps)) {
            deps = [deps];
        }

        for (i = 0; i < deps.length; i++) {
            dep = deps[i];
            ret.unshift(dep);

            anotherDeps = getDeps(dep);
            for (j = 0; j < anotherDeps.length; j++) {
                anotherDep = anotherDeps[j];
                if (indexOf(anotherDep) === -1) {
                    ret.unshift(anotherDep);
                }
            }
        }
        dependenciesMap[name] = ret;
        return ret;
    }

    function Module() {
        // body...
        // 依赖该模块的模块数
        this.depsCount = 0;
    }
    Module.prototype = {

    };
})(tbtx);