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

           path.join(conf.paths.src, '/editors/app/vendor/jsandbox/src/jsandbox.js'),

           path.join(conf.paths.tmp, '/conf/*.js'),
           '!' + path.join(conf.paths.src, '/app/**/*.spec.js'),
           '!' + path.join(conf.paths.src, '/app/**/_*.js')
        ])
        .pipe($.webpack(webpackOptions, null, webpackChangeHandler))
        .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve/app')));
}

gulp.task('scripts', function () {
    return webpack(false);
});

gulp.task('scripts:watch', ['editor:templates', 'scripts'], function (callback) {
    return webpack(true, callback);
});
