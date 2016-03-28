// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function (config) {

    config.set({
        plugins: [
//            'karma-chrome-launcher',
            'karma-jasmine',
            'karma-phantomjs-launcher',
            'karma-fixtures-preprocessor'
        ],
        // base path, that will be used to resolve files and exclude
        basePath: '',

        // testing framework to use (jasmine/mocha/qunit/...)
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: [
            'app/vendor/jsandbox/src/jsandbox.js',
            'app/vendor/raphael/raphael.js',
            'app/vendor/raphael/raphael.button.js',
            'app/vendor/raphael/raphael.curve.js',
            'app/vendor/raphael/raphael.group.js',

            'app/bower_components/jquery/dist/jquery.js',

            'app/bower_components/angular/angular.js',
            'app/bower_components/angular-mocks/angular-mocks.js',
            'app/bower_components/angular-resource/angular-resource.js',
            'app/bower_components/angular-cookies/angular-cookies.js',
            'app/bower_components/angular-sanitize/angular-sanitize.js',
            'app/bower_components/angular-animate/angular-animate.js',
            'app/bower_components/angular-route/angular-route.js',

            'app/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
            'app/bower_components/lodash/dist/lodash.js',
            'app/bower_components/ng-prettyjson/src/ng-prettyjson.js',

            'app/bower_components/localforage/dist/localforage.js',
            'app/bower_components/angular-localForage/dist/angular-localForage.js',

            'app/bower_components/zeroclipboard/dist/ZeroClipboard.js',

            'app/bower_components/marked/lib/marked.js',
            'app/bower_components/angular-marked/angular-marked.js',

            'app/bower_components/codemirror/lib/codemirror.js',
            'app/bower_components/codemirror/mode/javascript/javascript.js',

            'app/scripts/*.js',
            'app/scripts/main/**/*.js',

            'app/scripts/common/*.js',
            'app/scripts/cliche/*.js',
            'app/scripts/dyole/*.js',
            'app/scripts/repo/*.js',
            'app/scripts/app/*.js',

            'app/scripts/common/**/*.js',
            'app/scripts/cliche/**/*.js',
            'app/scripts/dyole/**/*.js',
            'app/scripts/repo/**/*.js',
            'app/scripts/app/**/*.js',

            'test/mock/*.json',
            'test/spec/**/*.js'
        ],

        preprocessors: {
            'test/mock/*.json': ['fixtures']
        },

        // list of files / patterns to exclude
        exclude: [],

        // web server port
        port: 8080,

        // level of logging
        // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,


        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers: ['PhantomJS'],


        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false

    });
};