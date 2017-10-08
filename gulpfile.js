// Gulp.js configuration
var
    // modules
    gulp = require('gulp'),
    concat = require('gulp-concat'),
    deporder = require('gulp-deporder'),
    stripdebug = require('gulp-strip-debug'),
    uglify = require('gulp-uglify'),

    // development mode?
    devBuild = (process.env.NODE_ENV !== 'production'),

    // folders
    folder = {
        src: './src/lib/',
        dst: './src/'
    };

//JavaScript processing
gulp.task('js-dev', function() {

    var jsbuild = gulp.src([
            folder.src + 'jaxon.config.js',
            folder.src + 'jaxon.tools.js',
            folder.src + 'jaxon.command.js',
            folder.src + 'jaxon.html.js',
            folder.src + 'jaxon.ajax.js',
            folder.src + 'jaxon.dom.js',
            folder.src + 'jaxon.js'
        ])
        // .pipe(deporder())
        .pipe(concat('jaxon.core.js', {newLine: '\n\n'}));

    /*if (!devBuild) {
        jsbuild = jsbuild
            .pipe(stripdebug())
            .pipe(uglify());
    }*/

    return jsbuild.pipe(gulp.dest(folder.dst));

});

//JavaScript processing
gulp.task('js-min', function() {

  var jsbuild = gulp.src([
          folder.src + 'jaxon.config.js',
          folder.src + 'jaxon.tools.js',
          folder.src + 'jaxon.command.js',
          folder.src + 'jaxon.html.js',
          folder.src + 'jaxon.ajax.js',
          folder.src + 'jaxon.dom.js',
          folder.src + 'jaxon.js'
      ])
      // .pipe(deporder())
      .pipe(concat('jaxon.core.min.js'))
      // .pipe(stripdebug())
      .pipe(uglify());

  return jsbuild.pipe(gulp.dest(folder.dst));

});
