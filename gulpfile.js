var gulp = require('gulp'),
    concat = require('gulp-concat'),
    minifyCss = require('gulp-minify-css'),
    rename = require("gulp-rename"),
    inject = require('gulp-inject'),
    crypto = require('crypto'),
    fs = require('fs'),
    path = require('path');

var cssFile = 'style.min.css';

gulp.task('minify-concat-css', function() {
    return gulp.src('./css/**/*.css')
        .pipe(concat('style.css'))
        .pipe(minifyCss())
        .pipe(rename(cssFile))
        .pipe(gulp.dest('./css/'));
});

gulp.task('inject', function() {
    var styleFile = path.resolve('./css/' + cssFile);
    var cssSha = checksum(fs.readFileSync(styleFile), 'sha1');
    var target = gulp.src('./index.html');
    var sources = gulp.src([styleFile], {read: false});

    return target.pipe(inject(sources, {addSuffix: '?version='+cssSha}))
        .pipe(gulp.dest('./'));
});

gulp.task('inject-styles', function() {
    var target = gulp.src('./index.html');
    var sources = gulp.src(['./css/**/*.css'], {read: false});

    return target.pipe(inject(sources))
        .pipe(gulp.dest('./'));
});

gulp.task('prod', ['minify-concat-css', 'inject']);
gulp.task('dev', ['inject-styles']);

function checksum (str, algorithm, encoding) {
    return crypto
        .createHash(algorithm || 'md5')
        .update(str, 'utf8')
        .digest(encoding || 'hex')
}
