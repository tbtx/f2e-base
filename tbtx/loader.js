(function(S) {
    // 简单模块定义和加载
    var noop = S.noop,
        isArray = S.isArray,
        each = S.each,
        unique = S.unique,
        indexOf = S.indexOf,
        loadScript = S.loadScript;

    var Loader = S.namespace("Loader"),

        // 缓存计算过的依赖
        _dependenciesMap = Loader.dependenciesMap = {},

        _data = Loader.data = {
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
        return $.extend(true, _data, val);
    };

    S.require = function(names, callback, baseUrl) {
        baseUrl = baseUrl || _data.baseUrl;
        callback = callback || noop;

        if (!isArray(names)) {
            names = [names];
        }

        // 获取各个的依赖，将依赖最多的排在前面来进行unique
        var depsToOrder = [];
        each(names, function(name) {
            depsToOrder.push(getDeps(name));
        });
        depsToOrder.sort(function(v1, v2) {
            return v1.length < v2.length;
        });

        // 加上自身，unique
        var deps = [];
        each(depsToOrder, function(item) {
            deps = deps.concat(item);
        });
        deps = deps.concat(names);
        deps = unique(deps);

        var scripts = S.map(deps, function(item) {
            var ret = _data.paths[item] || baseUrl + item;
            if (!S.endsWith(ret, ".js")) {
                ret += ".js";
            }
            ret += "?" + _data.urlArgs;
            return ret;
        });

        return loadScript(scripts, callback);
    };

    /*
     * 获取模块依赖
     * 暂时只处理单个组件之间的依赖
     * 外部的依赖请自行处理
     *
     * 如果依赖多个模块，请按照模块从大到小的包含顺序写
     */
    function getDeps(name) {
        var ret = [],
            i,
            j,
            // 依赖配置
            depsConfig = _data.deps,
            deps = depsConfig[name],
            anotherDeps,
            anotherDep,
            dep;

        if (_dependenciesMap[name]) {
            return _dependenciesMap[name];
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
        _dependenciesMap[name] = ret;
        return ret;
    }

    function Module() {
    }
    Module.prototype = {

    };
})(tbtx);