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
    lang: './dist/lang/'
};
const files = {
    src: {
        core: [
            folders.src + 'config.js',
            folders.src + 'utils/*.js',
            folders.src + 'parser/*.js',
            folders.src + 'dialog/*.js',
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
        chibi: 'libs/chibi/chibi.js',
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
    min: {
        core: 'jaxon.core.min.js',
        debug: 'jaxon.debug.min.js',
        chibi: 'libs/chibi/chibi.min.js',
    },
};

// Concat core library files
const js_core = () => {
    const jsbuild = src(files.src.core)
        // .pipe(deporder())
        .pipe(concat(files.dist.core, {newLine: "\n\n"}));

    return jsbuild.pipe(dest(folders.dist));
};

// Concat core library files into a module
const js_module = () => {
    const jsbuild = src([...files.src.core, files.src.module])
        // .pipe(deporder())
        .pipe(concat(files.dist.module, {newLine: "\n\n"}));

    return jsbuild.pipe(dest(folders.dist));
};

// Concat and minify core library files
const js_core_min = () => src(folders.dist + files.dist.core)
    // .pipe(stripdebug())
    .pipe(terser())
    .pipe(rename(files.min.core))
    .pipe(dest(folders.dist));

// Minify the jaxon.debug.js file
const js_debug_min = () => src(folders.dist + files.dist.debug)
    // .pipe(stripdebug())
    .pipe(terser())
    .pipe(rename(files.min.debug))
    .pipe(dest(folders.dist));

// Minify the chibi.js file
const js_chibi_min = () => src(folders.dist + files.dist.chibi)
    // .pipe(stripdebug())
    .pipe(terser())
    .pipe(rename(files.min.chibi))
    .pipe(dest(folders.dist));

// Minify the jaxon language files
const js_lang_min = () => src(files.dist.lang)
    // .pipe(stripdebug())
    .pipe(terser())
    .pipe(rename(path => {
        // path.dirname = "";
        path.basename += ".min";
        // path.extname = ""
    }))
    .pipe(dest(folders.lang));

// Minify all the files
const js_all = series(js_core, js_module, js_core_min, js_debug_min, js_chibi_min, js_lang_min);

exports.default = js_all;
exports.js_core = js_core;
