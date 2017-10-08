// Gulp.js configuration

// Modules
var gulp = require('gulp'),
    concat = require('gulp-concat'),
    // deporder = require('gulp-deporder'),
    // stripdebug = require('gulp-strip-debug'),
    uglify = require('gulp-uglify');

// Development mode?
var devBuild = (process.env.NODE_ENV !== 'production');

// Folders and files
var folder = {
        src: './src/lib/',
        dst: './src/'
    },

    sources = [
        folder.src + 'jaxon.config.js',
        folder.src + 'jaxon.tools.js',
        folder.src + 'jaxon.fn.js',
        folder.src + 'jaxon.html.js',
        folder.src + 'jaxon.ajax.js',
        folder.src + 'jaxon.dom.js',
        folder.src + 'jaxon.js',
        folder.src + 'jaxon.compat.js'
   ];

// Concat core library files
gulp.task('js-core', function() {
    var jsbuild = gulp.src(sources)
        // .pipe(deporder())
        .pipe(concat('jaxon.core.js', {newLine: '\n\n'}));

    /*if (!devBuild) {
        jsbuild = jsbuild
            .pipe(stripdebug())
            .pipe(uglify());
    }*/

    return jsbuild.pipe(gulp.dest(folder.dst));
});

// Concat and minify core library files
gulp.task('js-core-min', ['js-core'], function() {
    return gulp.src(folder.dst + 'jaxon.core.js')
        // .pipe(stripdebug())
        .pipe(concat('jaxon.core.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(folder.dst));
});

// Minify the jaxon.debug.js file
gulp.task('js-debug-min', function() {
    return gulp.src(folder.dst + 'jaxon.debug.js')
        // .pipe(stripdebug())
        .pipe(concat('jaxon.debug.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(folder.dst));
});

// Minify the jaxon.verbose.js file
gulp.task('js-verbose-min', function() {
    return gulp.src(folder.dst + 'jaxon.verbose.js')
        // .pipe(stripdebug())
        .pipe(concat('jaxon.verbose.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(folder.dst));
});

// Minify all the files
gulp.task('js-min', ['js-core-min', 'js-debug-min', 'js-verbose-min']);
