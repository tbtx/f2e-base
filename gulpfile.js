var gulp = require('gulp');
var fs = require("fs");
var gulpLoadPlugins = require('gulp-load-plugins');
var plugins = gulpLoadPlugins();
var pkg = require('./package.json');

var header = fs.readFileSync("header.txt", "utf-8");

gulp.task("jshint", function() {
    gulp.src([
            './src/*.js',
            '!./src/intro.js',
            '!./src/outro.js',
            './tbtx.js'
        ])
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('default'));
});

gulp.task('main', function() {
    var modules = ['intro', 'seed', 'lang', 'uri', 'events', 'support', 'loader', 'config', 'cookie', 'date', 'request', 'outro'];

    gulp.src(modules.map(function(module) {
            return './src/' + module + '.js';
        }))
        .pipe(plugins.concat('tbtx.js'))
        .pipe(plugins.header(header, {
            pkg: pkg,
            buildTime: new Date().toLocaleString()
        }))
        .pipe(gulp.dest('.'));
        // .pipe(plugins.concat('tbtx.min.js'))
        // .pipe(plugins.uglify())
        // .pipe(gulp.dest('.'));

    modules = ['intro', 'seed', 'lang.mobile', 'uri', 'events', 'support', 'loader', 'config.mobile', 'cookie', 'date', 'request', 'outro'];
    gulp.src(modules.map(function(module) {
            return './src/' + module + '.js';
        }))
        .pipe(plugins.concat('tbtx.mobile.js'))
        .pipe(plugins.header(header, {
            pkg: pkg,
            buildTime: new Date().toLocaleString()
        }))
        .pipe(gulp.dest('.'));
        // .pipe(plugins.concat('tbtx.mobile.min.js'))
        // .pipe(plugins.uglify())
        // .pipe(gulp.dest('.'));
});

gulp.task('watch', function() {

    gulp.watch('./src/*.js', ['jshint', 'main']);

});

gulp.task('default', ['jshint', 'main', 'watch']);