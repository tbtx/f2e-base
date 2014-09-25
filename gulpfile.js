var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var plugins = gulpLoadPlugins();

gulp.task("jshint", function() {
    gulp.src([
            './src/*.js',
            '!./src/intro.js',
            '!./src/outro.js'
        ])
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('default'));
});

gulp.task('main', function() {
    var modules = ['intro', 'seed', 'lang', 'uri', 'outro'];


    gulp.src(modules.map(function(module) {
            return './src/' + module + '.js';
        }))
        .pipe(plugins.concat('tbtx.js'))
        .pipe(gulp.dest('.'));
});

gulp.task('watch', function() {

    gulp.watch('./src/*.js', ['jshint', 'main']);

});

gulp.task('default', ['jshint', 'main', 'watch']);