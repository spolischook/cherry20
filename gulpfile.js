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

gulp.task('inject-prod', ['minify-concat-css'], function() {
    var styleFile = path.resolve('./css/' + cssFile);
    injectSources([styleFile]);
});

gulp.task('inject-dev', function() {
    injectSources(['./css/**/*.css']);
});

gulp.task('prod', ['minify-concat-css', 'inject-prod']);
gulp.task('dev', ['inject-dev']);

function checksum (str, algorithm, encoding) {
    return crypto
        .createHash(algorithm || 'md5')
        .update(str, 'utf8')
        .digest(encoding || 'hex')
}

function injectSources(files) {
    var target = gulp.src('./index.html');
    var sources = gulp.src(files, {read: false});

    return target.pipe(inject(sources, {
        starttag: '"{{ext}}": [',
        endtag: ']',
        transform: function (filepath, file, i, length) {
            var cssSha = checksum(fs.readFileSync('.'+filepath), 'sha1');
            return '  "' + filepath + '?version=' + cssSha + '"' + (i + 1 < length ? ',' : '');
        }
    })).pipe(gulp.dest('./'));
}
