'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');


gulp.task('copy:images', function() {
    gulp.src(path.join(conf.paths.src, '/editors/app/images/**/*'))
        .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve/images')))
});

