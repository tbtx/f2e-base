var gulp = require("gulp");

// npm install gulp gulp-jshint gulp-concat gulp-uglify --save-dev

// API
// task
// run
// watch
// src
// dest

var jshint = require("gulp-jshint");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");

var sourceFiles =[
    "src/*.js",
    "src/dist/*.js",
    "src/component/*/*/*.js",

    // ignores
    "!src/component/validator/*/*.js"
];


gulp.task("jshint", function() {
    gulp.src(sourceFiles)
        .pipe(jshint())
        .pipe(jshint.reporter("default"));
});

gulp.task("concat", function() {

    // tbtx
    gulp.src(["src/seed.js", "src/lang.js", "src/uri.js", "src/loader.js", "src/config.js", "src/cookie.js", "src/arale/events/1.1.0/events.js", "src/arale/position/1.0.1/position.js", "src/support.js", "src/date.js", "src/request.js", "src/msg.js", "src/register.js"])
        .pipe(concat("tbtx.js"))
        .pipe(gulp.dest("./"));

    // dist
    ["wangwang.js", "sitenav.js", "router.js"].forEach(function(name) {

        gulp.src("src/dist/" + name)
            .pipe(concat(name))
            .pipe(gulp.dest("./dist/"));

    });


    var araleConfig = {
        events: {
            version: "1.1.0"
        },
        "class": {
            version: "1.1.0"
        },
        base: {
            deps: ["class"],
            version: "1.1.1"
        },
        widget: {
            deps: ["class", "base"],
            version: "1.1.1"
        },
        position: {
            version: "1.0.1"
        },
        iframeShim: {
            version: "1.0.2"
        },
        templatable: {
            version: "0.9.2"
        },
        detector: {
            version: "1.3.0"
        },
        dnd: {
            version: "1.0.0"
        },
        sticky: {
            version: "1.4.0"
        }
    };

    // 生成src和dist
    each(araleConfig, function(item, name) {

        var version = item.version;
        var src = substitute("src/arale/{{ name }}/{{ version }}/{{ name }}.js", {
            name: name,
            version: version
        });

        var dest = src.replace("src", "dist");

        item.src = src;
        item.dest = dest;
    });

    // 合并依赖src
    each(araleConfig, function(item, name, array) {

        var deps = item.deps;
        if (deps) {
            deps = deps.map(function(dep) {
                return array[dep].src;
            });

            deps.push(item.src);

            item.depsSrc = deps;
        }
    });

    // 写入
    each(araleConfig, function(item, key) {

        var src = item.depsSrc || item.src;

        gulp.src(src)
            .pipe(concat(item.dest))
            .pipe(gulp.dest("."));
    });


    var componentConfig = {
        overlay: {
            version: "1.1.4"
        },
        popup: {
            version: "1.0.0"
        },
        switchable: {
            version: "1.0.3"
        },
        validator: {
            version: "0.9.7"
        },
        countDown: {
            version: "1.0.0"
        },
        pagination: {
            version: "1.0.0"
        }
    };

    each(componentConfig, function(item, name) {

        var version = item.version;
        var src = substitute("src/component/{{ name }}/{{ version }}/{{ name }}.js", {
            name: name,
            version: version
        });

        var dest = src.replace("src/", "");

        item.src = src;
        item.dest = dest;
    });

    componentConfig.overlay.src = [araleConfig.iframeShim.src, componentConfig.overlay.src];

    componentConfig.popup.src = componentConfig.overlay.src.concat([componentConfig.popup.src]);

    each(componentConfig, function(item, key) {

        var src = item.src;

        gulp.src(src)
            .pipe(concat(item.dest))
            .pipe(gulp.dest("."));
    });

});
// The default task (called when you run `gulp` from cli)
gulp.task("default", ["jshint", "concat"]);


function each(object, fn, context) {
    var i = 0,
        key,
        keys,
        length = object.length;

    context = context || null;

    if (length === +length) {
        for (; i < length; i++) {
            if (fn.call(context, object[i], i, object) === false) {
                break;
            }
        }
    } else {
        keys = Object.keys(object);
        length = keys.length;
        for (; i < length; i++) {
            key = keys[i];
            // can not use hasOwnProperty
            if (fn.call(context, object[key], key, object) === false) {
                break;
            }
        }
    }
}

function substitute(str, o) {
    return str.replace(/\\?\{\{\s*([^{}\s]+)\s*\}\}/g, function(match, name) {
        if (match.charAt(0) === "\\") {
            return match.slice(1);
        }
        return (o[name] === undefined) ? "" : o[name];
    });
}
