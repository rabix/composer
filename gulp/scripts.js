'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

var browserSync = require('browser-sync');

var $ = require('gulp-load-plugins')();

var replace = require('gulp-replace-task');
var _ = require('lodash');

// get cmd args for config
var minimist = require('minimist');

var args = minimist(process.argv.slice(2));

var configFile = _.find(args, function (value, arg) {
    return arg === 'c' || arg === 'config';
});

var _confPath = configFile || '../../server/config/local.env';
var _conf = JSON.stringify(require(_confPath));

function filterConfig(conf) {
    var config = _.clone(JSON.parse(conf), true);
    var forbidden = ['GITHUB*', 'SESSION_SECRET', 'GOOGLE*', 'TWITTER*',  'FACEBOOK*'];

    _.forEach(config, function (val, key) {

        // TODO: fix find not optimal
        var find = _.find(forbidden, function (v) {
            var pattern = new RegExp(v , 'ig');
            return pattern.test(key);
        });

        if (find) {
            config[key] = null;
            delete config[key];
        }
    });

    return JSON.stringify(config);
}

function webpack(watch, callback) {
    var webpackOptions = {
        watch: watch,
        module: {
           // preLoaders: [{test: /\.js$/, exclude: /node_modules/, loader: 'jshint-loader'}],
            loaders: [
                {test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'}]
        },
        output: {filename: 'index.module.js'}
    };

    if (watch) {
        webpackOptions.devtool = 'inline-source-map';
    }

    var webpackChangeHandler = function (err, stats) {
        if (err) {
            conf.errorHandler('Webpack')(err);
        }
        $.util.log(stats.toString({
            colors: $.util.colors.supportsColor,
            chunks: false,
            hash: false,
            version: false
        }));
        browserSync.reload();
        if (watch) {
            watch = false;
            callback();
        }

    };





   return gulp.src([
           path.join(conf.paths.src, '/app/**/*.js'),

           path.join(conf.paths.src, '/editors/app/scripts/**/*.js'),
           path.join(conf.paths.src, '/editors/app/vendor/raphael/raphael.button.js'),
           path.join(conf.paths.src, '/editors/app/vendor/raphael/raphael.curve.js'),
           path.join(conf.paths.src, '/editors/app/vendor/raphael/raphael.group.js'),

           path.join(conf.paths.src, '/editors/app/vendor/chronicle/chronicle.js'),
           path.join(conf.paths.src, '/editors/app/vendor/angular-ui-sortable/sortable.min.js'),
           path.join(conf.paths.src, '/editors/app/vendor/jsandbox/min/jsandbox.min.js'),

           path.join(conf.paths.tmp, '/conf/*.js'),
           '!' + path.join(conf.paths.src, '/app/**/*.spec.js'),
           '!' + path.join(conf.paths.src, '/app/**/_*.js'),

           path.join(conf.paths.tmp, '/conf/*.js'),
           '!' + path.join(conf.paths.src, '/app/**/*.spec.js'),
           '!' + path.join(conf.paths.src, '/app/**/_*.js')
        ])
        .pipe($.webpack(webpackOptions, null, webpackChangeHandler))
        .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve/app')));
}

gulp.task('config', function () {

    return gulp.src(path.join(conf.paths.src + '/app/config/_cottontail.config.js'))
        .pipe(replace({
            patterns: [{
                match: '{{{APP_CONFIG}}}',
                replacement: filterConfig(_conf)
            }],
            usePrefix: false
        }))
        .pipe(gulp.dest(path.join(conf.paths.tmp, '/conf/')));
});

gulp.task('scripts', ['config'], function () {
    return webpack(false);
});

gulp.task('scripts:watch', ['scripts'], function (callback) {
    return webpack(true, callback);
});
