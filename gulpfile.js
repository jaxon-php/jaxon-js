// Gulp.js configuration

// Modules
const { src, dest, series } = require('gulp');
const concat = require('gulp-concat');
// const deporder = require('gulp-deporder');
const rename = require('gulp-rename');
// const stripdebug = require('gulp-strip-debug');
const terser = require('gulp-terser');

// Folders and files
const folders = {
    src: './src/',
    dist: './dist/',
    lang: './dist/lang/',
    libs: './dist/libs/',
};
const files = {
    src: {
        core: [
            folders.src + 'config.js',
            folders.src + 'utils/*.js',
            folders.src + 'libs/*.js',
            folders.src + 'parser/*.js',
            folders.src + 'ajax/*.js',
            folders.src + 'cmd/*.js',
            folders.src + 'jaxon.js',
        ],
        module: folders.src + 'module.js',
    },
    dist: {
        core: 'jaxon.core.js',
        debug: 'jaxon.debug.js',
        module: 'jaxon.module.js',
        chibi: 'chibi.js',
        lang: [
            folders.dist + 'lang/jaxon.bg.js',
            folders.dist + 'lang/jaxon.de.js',
            folders.dist + 'lang/jaxon.en.js',
            folders.dist + 'lang/jaxon.es.js',
            folders.dist + 'lang/jaxon.fr.js',
            folders.dist + 'lang/jaxon.nl.js',
            folders.dist + 'lang/jaxon.tr.js'
        ],
    },
};

// Concat the core library files
const js_core = () => src(files.src.core)
    // .pipe(deporder())
    .pipe(concat(files.dist.core, {newLine: "\n\n"}))
    .pipe(dest(folders.dist));

// Concat the core library files into a module
const js_module = () => src([...files.src.core, files.src.module])
    // .pipe(deporder())
    .pipe(concat(files.dist.module, {newLine: "\n\n"}))
    .pipe(dest(folders.dist));

// Minify the core library files
const js_core_min = () => src(folders.dist + files.dist.core)
    // .pipe(stripdebug())
    .pipe(terser())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(dest(folders.dist));

// Minify the jaxon.debug.js file
const js_debug_min = () => src(folders.dist + files.dist.debug)
    // .pipe(stripdebug())
    .pipe(terser())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(dest(folders.dist));

// Minify the chibi.js file
const js_chibi_min = () => src(folders.libs + 'chibi/' + files.dist.chibi)
    // .pipe(stripdebug())
    .pipe(terser())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(dest(folders.libs + 'chibi/'));

// Minify the jaxon language files
const js_lang_min = () => src(files.dist.lang)
    // .pipe(stripdebug())
    .pipe(terser())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(dest(folders.lang));

exports.default = series(js_core, js_module, js_core_min, js_debug_min, js_chibi_min, js_lang_min);
exports.js_core = js_core;
