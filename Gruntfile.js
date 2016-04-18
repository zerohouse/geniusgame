/**
 * Created by park on 15. 4. 23..
 */

module.exports = function (grunt) {

    grunt.file.defaultEncoding = "utf8";

    var config = {pkg: grunt.file.readJSON('package.json')};
    config.concat = {};
    config.watch = {};
    config.karma = {};
    config.mochaTest = {};

    // Client JS File Concat And Uglify
    config.concat.client = {
        src: [
            'client/**/*.pre.js',
            'client/**/*.js',
            'client/**/*.post.js',
            '!client/**/*_test.js'
        ],
        dest: 'dist/js.js'
    };
    config.uglify = {
        options: {
            mangle: false
        },
        build: {
            src: 'dist/js.js',
            dest: 'dist/js.min.js'
        }
    };
    config.karma.client = {
        options: {
            frameworks: ['jasmine'],
            singleRun: true,
            browsers: ['PhantomJS'],
            files: [
                'node_modules/angular/angular.js',
                'node_modules/angular-mocks/angular-mocks.js',
                'node_modules/angular-ui-router/build/angular-ui-router.min.js',
                'node_modules/angular-ui-bootstrap/ui-bootstrap.min.js',
                'dist/js.js',
                'client/**/*_test.js'
            ]
        }
    };
    config.watch.client = {
        files: [
            'client/**/*.js'
        ],
        tasks: ['concat:client', 'uglify'],
        options: {
            interrupt: true
        }
    };
    //config.watch.clientTest = {
    //    files: [
    //        'client/**/*_test.js'
    //    ],
    //    tasks: ['karma:client'],
    //    options: {
    //        interrupt: true
    //    }
    //};


    // LESS Comfile And Concat
    config.less = {
        src: {
            expand: true,
            cwd: "client",
            dest: 'dist/css',
            src: "**/*.less",
            ext: ".css"
        }
    };
    config.concat_css = {
        all: {
            src: [
                "dist/css/**/*.css"
            ],
            dest: "dist/style.css"
        }
    };
    config.cssmin = {
        target: {
            files: [{
                expand: true,
                src: "dist/style.css",
                ext: '.min.css'
            }]
        }
    };
    config.clean = ['dist/css'];
    config.watch.css = {
        files: [
            'client/**/*.less'
        ],
        tasks: ['less', 'concat_css', 'cssmin', 'clean'],
        options: {
            interrupt: true
        }
    };

    // Copy Htmls
    config.copy = {
        main: {
            files: [
                {expand: true, cwd: 'client/', src: ['**/*.html'], dest: 'dist'}
            ]
        }
    };

    config.watch.html = {
        files: [
            'client/**/*.html'
        ],
        tasks: ['copy'],
        options: {
            interrupt: true
        }
    };


    config.watch.serverTest = {
        files: [
            'server/**/*_test.js'
        ],
        tasks: ['mochaTest:server'],
        options: {
            interrupt: true
        }
    };

    config.mochaTest.server = {
        src: ['server/**/*_test.js']
    };

    config.nodemon = {
        dev: {
            script: 'server.dev.js'
        },
        options: {
            watch: ['./server']
        }
    };

    config.concurrent = {
        dev: ["nodemon", "watch"],
        options: {
            logConcurrentOutput: true
        }
    };


    grunt.initConfig(config);

    grunt.loadNpmTasks("grunt-concurrent");
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-concat-css');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-mocha-test');

    // Default task(s).
    grunt.registerTask('default', ['concat', 'uglify', 'less', 'concat_css', 'cssmin', 'copy', 'clean']);
    grunt.registerTask('run', ['default', 'concurrent:dev']);
};