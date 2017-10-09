// Gulp.js configuration

// Modules
var gulp = require('gulp'),
    concat = require('gulp-concat'),
    // deporder = require('gulp-deporder'),
    rename = require('gulp-rename'),
    // stripdebug = require('gulp-strip-debug'),
    uglify = require('gulp-uglify');

// Development mode?
var devBuild = (process.env.NODE_ENV !== 'production');

// Folders and files
var folders = {
        lib: './src/lib/',
        src: './src/'
    },

    files = {
        lib: {
            core: [
                folders.lib + 'jaxon.config.js',
                folders.lib + 'jaxon.tools.js',
                folders.lib + 'jaxon.fn.js',
                folders.lib + 'jaxon.html.js',
                folders.lib + 'jaxon.ajax.js',
                folders.lib + 'jaxon.dom.js',
                folders.lib + 'jaxon.js',
                folders.lib + 'jaxon.compat.js'
            ]
        },
        src: {
            core: 'jaxon.core.js',
            debug: 'jaxon.debug.js',
            verbose: 'jaxon.verbose.js'
        },
        min: {
            core: 'jaxon.core.min.js',
            debug: 'jaxon.debug.min.js',
            verbose: 'jaxon.verbose.min.js'
        }};

// Concat core library files
gulp.task('js-core', function() {
    var jsbuild = gulp.src(files.lib.core)
        // .pipe(deporder())
        .pipe(concat(files.src.core, {newLine: '\n\n'}));

    /*if (!devBuild) {
        jsbuild = jsbuild
            .pipe(stripdebug())
            .pipe(uglify());
    }*/

    return jsbuild.pipe(gulp.dest(folders.src));
});

// Concat and minify core library files
gulp.task('js-core-min', ['js-core'], function() {
    return gulp.src(folders.src + files.src.core)
        // .pipe(stripdebug())
        .pipe(uglify())
        .pipe(rename(files.min.core))
        .pipe(gulp.dest(folders.src));
});

// Minify the jaxon.debug.js file
gulp.task('js-debug-min', function() {
    return gulp.src(folders.src + files.src.debug)
        // .pipe(stripdebug())
        .pipe(uglify())
        .pipe(rename(files.min.debug))
        .pipe(gulp.dest(folders.src));
});

// Minify the jaxon.verbose.js file
gulp.task('js-verbose-min', function() {
    return gulp.src(folders.src + files.src.verbose)
        // .pipe(stripdebug())
        .pipe(uglify())
        .pipe(rename(files.min.verbose))
        .pipe(gulp.dest(folders.src));
});

// Minify all the files
gulp.task('js-min', ['js-core-min', 'js-debug-min', 'js-verbose-min']);
