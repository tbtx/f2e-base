module.exports = function(grunt) {

    // Initializes the Grunt tasks with the following settings
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // A list of files, which will be syntax-checked by JSHint
        jshint: {
            files: ['src/*.js'],
            options: {
                // 基本均为第三方文件，部分稍作扩展
                ignores: ["src/router.js"],
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
                src: ["src/seed.js", "src/lang.js", "src/uri.js", "src/loader.js", "src/config.js", "src/cookie.js", "src/arale/events/1.1.0/events.js", "src/arale/position/1.0.1/position.js", "src/support.js", "src/date.js", "src/request.js", "src/msg.js", "src/register.js"],
                dest: 'tbtx.js' // 合并成依赖文件
            },

            wangwang: {
                src: ["src/dist/wangwang.js"],
                dest: "dist/wangwang.js"
            },
            router: {
                src: ["src/dist/router.js"],
                dest: "dist/router.js"
            },

            class: {
                src: ["src/arale/class/1.1.0/class.js"],
                dest: "dist/arale/class/1.1.0/class.js"
            },
            events: {
                src: ["src/arale/events/1.1.0/events.js"],
                dest: "dist/arale/events/1.1.0/events.js"
            },
            base: {
                src: ["src/arale/class/1.1.0/class.js", "src/arale/base/1.1.1/base.js"],
                dest: "dist/arale/base/1.1.1/base.js"
            },
            widget: {
                src: ["src/arale/class/1.1.0/class.js", "src/arale/base/1.1.1/base.js", "src/arale/widget/1.1.1/widget.js"],
                dest: "dist/arale/widget/1.1.1/widget.js"
            },
            position: {
                src: ["src/arale/position/1.0.1/position.js"],
                dest: "dist/arale/position/1.0.1/position.js"
            },
            iframeShim: {
                src: ["src/arale/iframe-shim/1.0.2/iframe-shim.js"],
                dest: "dist/arale/iframe-shim/1.0.2/iframe-shim.js"
            },
            templatable: {
                src: ["src/arale/templatable/0.9.2/templatable.js"],
                dest: "dist/arale/templatable/0.9.2/templatable.js"
            },
            detector: {
                src: ["src/arale/detector/1.3.0/detector.js"],
                dest: "dist/arale/detector/1.3.0/detector.js"
            },
            dnd: {
                src: ["src/arale/dnd/1.0.0/dnd.js"],
                dest: "dist/arale/dnd/1.0.0/dnd.js"
            },
            sticky: {
                src: ["src/arale/sticky/1.4.0/sticky.js"],
                dest: "dist/arale/sticky/1.4.0/sticky.js"
            },


            // component
            overlay: {
                src: ["src/arale/iframe-shim/1.0.2/iframe-shim.js", "src/component/overlay/1.1.4/overlay.js"],
                dest: "component/overlay/1.1.4/overlay.js"
            },

            popup: {
                src: ["src/arale/iframe-shim/1.0.2/iframe-shim.js", "src/component/overlay/1.1.4/overlay.js", "src/component/popup/1.0.0/popup.js"],
                dest: "component/popup/1.0.0/popup.js"
            },

            switchable: {
                src: ["src/component/switchable/1.0.3/switchable.js"],
                dest: "component/switchable/1.0.3/switchable.js"
            },

            validator: {
                src: ["src/component/validator/0.9.7/validator.js"],
                dest: "component/validator/0.9.7/validator.js"
            },

            countDown: {
                src: ["src/component/countDown/1.0.0/countDown.js"],
                dest: "component/countDown/1.0.0/countDown.js"
            },

            countDown: {
                src: ["src/component/born/1.0.0/born.js"],
                dest: "component/born/1.0.0/born.js"
            },

            pagination: {
                src: ["src/component/pagination/1.0.0/pagination.js"],
                dest: "component/pagination/1.0.0/pagination.js"
            }
        },

        // copy: {
        //     main: {
        //         expand: true,
        //         cwd: 'src/',
        //         src: "arale/**",
        //         dest: "dist/"
        //     }
        // },

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
                files: ['src/*.js', "src/dist/*.js"],
                tasks: ['jshint', 'concat', 'uglify']
            }
        }
    });

    // Load the plugins that provide the tasks we specified in package.json.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');

    // This is the default task being executed if Grunt
    // is called without any further parameter.
    grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'watch']);

};
