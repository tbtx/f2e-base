module.exports = function(grunt) {

    // Initializes the Grunt tasks with the following settings
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // A list of files, which will be syntax-checked by JSHint
        jshint: {
            files: ['tbtx/*.js', 'component/overlay.js', 'component/popup.js', 'component/draggable.js'],
            options: {
                ignores: ['tbtx/detector.js', 'tbtx/pin.js', 'tbtx/aspect.js', 'tbtx/events.js', 'tbtx/attrs.js', 'tbtx/widget.js'],
                browser: true,
                sub: true,
                proto: true
            }
        },

        // Files to be concatenated … (source and destination files)
        concat: {
            options: {
                separator: '\n\n;',
                banner: '/*\n * <%= pkg.name %>\n * <%= grunt.template.today("yyyy-mm-dd h:MM:ss") %>\n * <%= pkg.author %>\n * <%= pkg.email %>\n */\n'
            },
            common: {
                src: ['tbtx/seed.js', 'tbtx/cache.js', 'tbtx/lang.js', 'tbtx/events.js', 'tbtx/aspect.js', 'tbtx/attrs.js', 'tbtx/widget.js', 'tbtx/cookie.js', 'tbtx/date.js', 'tbtx/detector.js', 'tbtx/pin.js', 'tbtx/path.js', 'tbtx/dom.js', 'tbtx/loader.js', 'tbtx/support.js', 'tbtx/msg.js', 'tbtx/miiee.js'],
                dest: 'tbtx.js' // 合并成依赖文件
            },
            popup: {
                options: {
                    banner: '/*\n * overlay.popup\n * <%= grunt.template.today("yyyy-mm-dd h:MM:ss") %>\n */\n'
                },
                src: ['component/overlay.js', 'component/popup.js'],
                dest: 'component/overlay.popup.js'
            }
        },

        // js … and minified (source and destination files)
        uglify: {
            build: {
                files: {
                    'tbtx.min.js': ['tbtx.js'],
                }
            }
        },

        // Tasks being executed with 'grunt watch'
        watch: {
            js: {
                files: ['tbtx/*.js', 'component/*.js'],
                tasks: ['jshint', 'concat', 'uglify']
            }
        }
    });

    // Load the plugins that provide the tasks we specified in package.json.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-stylus');

    // This is the default task being executed if Grunt
    // is called without any further parameter.
    grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'watch']);

};
