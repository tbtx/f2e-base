module.exports = function(grunt) {

    // Initializes the Grunt tasks with the following settings
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // A list of files, which will be syntax-checked by JSHint
        jshint: {
            files: ['tbtx/*.js'],
            options: {
                ignores: ['tbtx/detector.js'],
                browser: true,
                sub: true
            }
        },

        // Files to be concatenated … (source and destination files)
        concat: {
            options: {
                separator: '\n\n;',
                banner: '/* <%= pkg.name %> -- <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            common: {
                src: ['tbtx/seed.js', 'tbtx/lang.js', 'tbtx/cookie.js', 'tbtx/detector.js', 'tbtx/dom.js', 'tbtx/path.js', 'tbtx/miiee.js'],
                dest: 'tbtx.js' // 合并成依赖文件
            },
            popup: {
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
