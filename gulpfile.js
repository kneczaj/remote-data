var gulp = require('gulp');
var del = require('del');
var ngc = require('gulp-ngc');
const fs = require('fs');

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
  return gulp.src([
    paths.lib + '**/*',
    '!**/*.spec.ts',
    './tsconfig.json'
  ]).pipe(gulp.dest(paths.build));
});

gulp.task('copy_dist', ['clean'], function() {
  return gulp.src([
    './README.md',
    './LICENSE',
    './package.json'
  ]).pipe(gulp.dest(paths.dist));
});

gulp.task('clean:packageJson', ['copy_dist'], function() {
  const packageJsonPath = paths.dist + 'package.json';
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath));
  delete packageJson['dependencies'];
  delete packageJson['scripts'];
  delete packageJson['devDependencies'];
  fs.writeFile(packageJsonPath, JSON.stringify(packageJson));
});

gulp.task('ngc', ['copy'], function() {
  return ngc(paths.build + 'tsconfig.json');
});

gulp.task('build', ['ngc', 'copy_dist', 'clean:packageJson'], function() {});

// TODO: add publish script
