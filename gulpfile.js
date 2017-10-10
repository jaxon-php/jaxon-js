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
        src: './src/',
        lang: './src/lang/'
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
            lang: [
                folders.src + 'lang/jaxon.bg.js',
                folders.src + 'lang/jaxon.de.js',
                folders.src + 'lang/jaxon.en.js',
                folders.src + 'lang/jaxon.es.js',
                folders.src + 'lang/jaxon.fr.js',
                folders.src + 'lang/jaxon.nl.js',
                folders.src + 'lang/jaxon.tr.js'
            ]
        },
        min: {
            core: 'jaxon.core.min.js',
            debug: 'jaxon.debug.min.js'
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

// Minify the jaxon language files
gulp.task('js-lang-min', function() {
    return gulp.src(files.src.lang)
        // .pipe(stripdebug())
        .pipe(uglify())
        .pipe(rename(function (path) {
            // path.dirname = "";
            path.basename += ".min";
            // path.extname = ""
        }))
        .pipe(gulp.dest(folders.lang));
});

// Minify all the files
gulp.task('js-min', ['js-core-min', 'js-debug-min']);
