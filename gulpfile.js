var gulp = require('gulp');

// npm install gulp gulp-jshint gulp-concat gulp-uglify --save-dev

// API
// task
// run
// watch
// src
// dest

var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

var paths = {
    src: ['src/*.js', 'src/dist/*.js', 'src/component/*/*/*.js'],
    ignore: ['!src/component/validator/*/*.js']
};
paths.scripts = paths.src.concat(paths.ignore);

gulp.task('jshint', function() {
    gulp.src(paths.scripts)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('concat', function() {

    // tbtx
    gulp.src(['src/seed.js', 'src/lang.js', 'src/uri.js', 'src/loader.js', 'src/config.js', 'src/cookie.js', 'src/arale/events/1.1.0/events.js', 'src/arale/position/1.0.1/position.js', 'src/support.js', 'src/date.js', 'src/request.js', 'src/msg.js', 'src/register.js'])
        .pipe(concat('tbtx.js'))
        .pipe(gulp.dest('./'));

    // dist
    ["wangwang.js", "sitenav.js", "router.js"].forEach(function(name) {
        // wangwang
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
    Object.keys(araleConfig).forEach(function(key) {
        var item = araleConfig[key];

        var version = item.version;
        var src = "src/arale/" + key + "/" + version + "/" + key + ".js";
        var dest = src.replace("src", "dist");

        item.src = src;
        item.dest = dest;
    });

    // 合并依赖src
    Object.keys(araleConfig).forEach(function(key) {
        var item = araleConfig[key];

        var src = item.depsSrc || item.src;

        gulp.src(src)
            .pipe(concat(item.dest))
            .pipe(gulp.dest("."));
    });


    Object.keys(araleConfig).forEach(function(key) {
        var item = araleConfig[key];

        var deps = item.deps;
        if (deps) {
            deps = deps.map(function(dep) {
                return araleConfig[dep].src;
            });

            deps.push(item.src);

            item.depsSrc = deps;
        }
    });
    console.log(araleConfig);

});
// The default task (called when you run `gulp` from cli)
gulp.task('default', ['jshint', 'concat']);
