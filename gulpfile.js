var gulp = require('gulp');
var del = require('del');
var ngc = require('gulp-ngc');

var paths = {
  dist: 'dist/',
  build: './build/',
  lib: 'src/lib/',
  scripts: ['client/js/**/*.coffee', '!client/external/**/*.coffee'],
  images: 'client/img/**/*'
};

gulp.task('clean', function() {
  return del([paths.build, paths.dist]);
});

gulp.task('copy', ['clean'], function() {
  return gulp.src([paths.lib + '**/*', '!**/*.spec.ts', './tsconfig.json']).pipe(gulp.dest(paths.build));
});

gulp.task('build', ['copy'], function() {
  return ngc(paths.build + 'tsconfig.json');
});
