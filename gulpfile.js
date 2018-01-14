const gulp = require('gulp');
const del = require('del');
const ngc = require('gulp-ngc');
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

gulp.task('copy:project-files', ['clean'], function() {
  return gulp.src([
    './README.md',
    './LICENSE',
    './package.json'
  ]).pipe(gulp.dest(paths.dist));
});

gulp.task('copy:ts', ['clean'], function() {
  return gulp.src(paths.lib + '**/*.ts').pipe(gulp.dest(paths.dist));
});

gulp.task('clean:packageJson', ['copy:project-files'], function() {
  const packageJsonPath = paths.dist + 'package.json';
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath));
  delete packageJson['scripts'];
  delete packageJson['devDependencies'];
  fs.writeFile(packageJsonPath, JSON.stringify(packageJson));
});

gulp.task('ngc', ['copy'], function() {
  return ngc(paths.build + 'tsconfig.json');
});

// build package compiled to js
gulp.task('build', ['ngc', 'copy:project-files', 'clean:packageJson'], function() {});

// build package with ts files - for development purposes
gulp.task('build:ts', ['copy:ts', 'copy:project-files', 'clean:packageJson'], function() {});

// TODO: add publish script
