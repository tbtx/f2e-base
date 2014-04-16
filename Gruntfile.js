module.exports = function(grunt) {

    // Initializes the Grunt tasks with the following settings
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // A list of files, which will be syntax-checked by JSHint
        jshint: {
            files: ['src/*.js'],
            options: {
                // 基本均为第三方文件，部分稍作扩展
                ignores: ["src/widget.js"],
                browser: true,      // 访问浏览器全局变量
                sub: true,          // person['name'] vs. person.name
                proto: true,        // use __proto__
                debug: true,        // debugger statements
                eqnull: true
            }
        },

        // Files to be concatenated … (source and destination files)
        concat: {
            options: {
                separator: '\n\n;'
            },

            main: {
                options: {
                    banner: '/*\n * <%= pkg.name %>\n * update: <%= grunt.template.today("yyyy-mm-dd h:MM:ss") %>\n * <%= pkg.author %>\n * <%= pkg.email %>\n */\n'
                },
                src: ["src/seed.js", "src/lang.js", "src/uri.js", "src/loader.js", "src/config.js"],
                dest: 'tbtx.js' // 合并成依赖文件
            },

            widget: {
                src: ["src/widget.js"],
                dest: "dist/widget.js"
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
                files: ['src/*.js'],
                tasks: ['jshint', 'concat', 'uglify']
            }
        }
    });

    // Load the plugins that provide the tasks we specified in package.json.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // This is the default task being executed if Grunt
    // is called without any further parameter.
    grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'watch']);

};
