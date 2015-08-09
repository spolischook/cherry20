var gulp = require('gulp'),
    concat = require('gulp-concat'),
    minifyCss = require('gulp-minify-css'),
    rename = require("gulp-rename"),
    inject = require('gulp-inject'),
    crypto = require('crypto'),
    fs = require('fs'),
    path = require('path');

var baseMinCssFile = 'main.min.css',
    baseCssFiles   = [
        'bower_components/pure/menus.css',
        'bower_components/pure/grids-responsive.css',
        'src/css/main.css'
    ],
    advancedMinCssFile = 'style.min.css',
    advancedCssFiles   = [
        'bower_components/photoswipe/dist/photoswipe.css',
        'bower_components/photoswipe/dist/default-skin/default-skin.css'
    ],
    target = gulp.src('./src/index.html');

//=====================================================//

gulp.task('prod', ['minify-concat-base-css', 'minify-concat-advanced-css', 'inject-prod']);
gulp.task('dev', ['inject-dev']);

//-----------------------------------------------------//

gulp.task('minify-concat-base-css', function() {
    return gulp.src(baseCssFiles)
        .pipe(concat('base.css'))
        .pipe(minifyCss())
        .pipe(rename(baseMinCssFile))
        .pipe(gulp.dest('./css/'));
});

gulp.task('minify-concat-advanced-css', ['minify-concat-base-css'], function() {
    return gulp.src(advancedCssFiles)
        .pipe(concat('advanced.css'))
        .pipe(minifyCss())
        .pipe(rename(advancedMinCssFile))
        .pipe(gulp.dest('./css/'));
});

gulp.task('inject-prod', ['minify-concat-advanced-css'], function() {
    var advancedStyleFile = path.resolve('./css/' + advancedMinCssFile);
    injectSources([advancedStyleFile]);

    var baseStyleFile = path.resolve('./css/' + baseMinCssFile);
    target.pipe(inject(gulp.src([baseStyleFile]), {
            starttag: '<!-- inject:head:{{ext}} -->',
            transform: function (filePath, file) {
                // return file contents as string
                return '<style>' + file.contents.toString('utf8') + '</style>';
            }
        }))
        .pipe(gulp.dest('./'));
});

gulp.task('inject-dev', function() {
    injectSources(advancedCssFiles);

    target.pipe(inject(gulp.src(baseCssFiles), {
        starttag: '<!-- inject:head:{{ext}} -->'
        }))
        .pipe(gulp.dest('./'));
});

//----------------------------------------------------------//

function checksum (str, algorithm, encoding) {
    return crypto
        .createHash(algorithm || 'md5')
        .update(str, 'utf8')
        .digest(encoding || 'hex')
}

function injectSources(files) {
    //var target = gulp.src('./index.html');
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
