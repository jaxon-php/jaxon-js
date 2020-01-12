// Gulp.js configuration

// Modules
var gulp = require('gulp'),
    concat = require('gulp-concat'),
    // deporder = require('gulp-deporder'),
    rename = require('gulp-rename'),
    // stripdebug = require('gulp-strip-debug'),
    terser = require('gulp-terser');

// Development mode?
var devBuild = (process.env.NODE_ENV !== 'production');

// Folders and files
var folders = {
        src: './src/',
        dist: './dist/',
        lang: './dist/lang/'
    },

    files = {
        src: {
            core: [
                folders.src + 'config.js',
                folders.src + 'tools/*.js',
                folders.src + 'cmd/*.js',
                folders.src + 'ajax/*.js',
                folders.src + 'ready.js',
                folders.src + 'jaxon.js',
                folders.src + 'compat.js'
            ]
        },
        dist: {
            core: 'jaxon.core.js',
            debug: 'jaxon.debug.js',
            lang: [
                folders.dist + 'lang/jaxon.bg.js',
                folders.dist + 'lang/jaxon.de.js',
                folders.dist + 'lang/jaxon.en.js',
                folders.dist + 'lang/jaxon.es.js',
                folders.dist + 'lang/jaxon.fr.js',
                folders.dist + 'lang/jaxon.nl.js',
                folders.dist + 'lang/jaxon.tr.js'
            ]
        },
        min: {
            core: 'jaxon.core.min.js',
            debug: 'jaxon.debug.min.js'
        }};

// Concat core library files
gulp.task('js-core', function() {
    var jsbuild = gulp.src(files.src.core)
        // .pipe(deporder())
        .pipe(concat(files.dist.core, {newLine: '\n\n'}));

    /*if (!devBuild) {
        jsbuild = jsbuild
            .pipe(stripdebug())
            .pipe(terser());
    }*/

    return jsbuild.pipe(gulp.dest(folders.dist));
});

// Concat and minify core library files
gulp.task('js-core-min', ['js-core'], function() {
    return gulp.src(folders.dist + files.dist.core)
        // .pipe(stripdebug())
        .pipe(terser())
        .pipe(rename(files.min.core))
        .pipe(gulp.dest(folders.dist));
});

// Minify the jaxon.debug.js file
gulp.task('js-debug-min', function() {
    return gulp.src(folders.dist + files.dist.debug)
        // .pipe(stripdebug())
        .pipe(terser())
        .pipe(rename(files.min.debug))
        .pipe(gulp.dest(folders.dist));
});

// Minify the jaxon language files
gulp.task('js-lang-min', function() {
    return gulp.src(files.dist.lang)
        // .pipe(stripdebug())
        .pipe(terser())
        .pipe(rename(function (path) {
            // path.dirname = "";
            path.basename += ".min";
            // path.extname = ""
        }))
        .pipe(gulp.dest(folders.lang));
});

// Minify all the files
gulp.task('js-min', ['js-core-min', 'js-debug-min', 'js-lang-min']);
gulp.task('default', ['js-min']);
