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
        depsMap = Loader.depsMap = {},

        _config = Loader._config = {
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
        return $.extend(true, _config, val);
    };

    S.define = function(name, dependencies, factory) {

    };

    S.require = function(name, callback) {
        callback = callback || noop;

        var deps = unique(getDeps(name));
        deps.push(name);

        var scripts = S.map(deps, function(item) {
            var ret = _config.paths[item] || _config.baseUrl + item;
            if (!S.endsWith(ret, ".js")) {
                ret += ".js";
            }
            ret += "?" + _config.urlArgs;
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
            depsConfig = _config.deps,
            deps = depsConfig[name],
            anotherDeps,
            anotherDep,
            dep;

        if (depsMap[name]) {
            return depsMap[name];
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
        depsMap[name] = ret;
        return ret;
    }

})(tbtx);