'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

var templateCache = require('gulp-angular-templatecache');

var replace = require('gulp-replace-task');

gulp.task('dyole:templates', function () {
    return gulp.src([
            path.join(conf.paths.src, '/editors/app/views/**/*.html'),
            path.join(conf.paths.src, '/editors/app/views/dyole/**/*.html'),
            path.join(conf.paths.src, '/editors/app/views/cliche/**/*.html'),
            path.join(conf.paths.src, '/editors/app/views/app/**/*.html'),
            path.join(conf.paths.src, '/editors/app/views/repo/**/*.html'),
            path.join(conf.paths.src, '/editors/app/views/task/**/*.html')
        ])
        .pipe(templateCache('template.js', {
            module: 'registryApp.dyole',
            root: 'views'
        }))
        .pipe(gulp.dest(
            path.join(conf.paths.src, '/editors/app/scripts/dyole/'))
        );
});

gulp.task('cliche:templates', function () {
    return gulp.src([
            path.join(conf.paths.src, '/editors/app/views/**/*.html'),
            path.join(conf.paths.src, '/editors/app/views/cliche/**/*.html'),
            path.join(conf.paths.src, '/editors/app/views/app/**/*.html'),
            path.join(conf.paths.src, '/editors/app/views/repo/**/*.html'),
            path.join(conf.paths.src, '/editors/app/views/task/**/*.html')
        ])
        .pipe(templateCache('template.js', {
            module: 'registryApp.cliche',
            root: 'views'
        }))
        .pipe(gulp.dest(
            path.join(conf.paths.src, '/editors/app/scripts/cliche/'))
        );
});

gulp.task('editor:templates', ['cliche:templates', 'dyole:templates'], function () {
    
});
