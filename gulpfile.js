const gulp = require('gulp');
const del = require('del');
const ngc = require('@angular/compiler-cli/src/main').main;
const fs = require('fs');

var paths = {
  dist: __dirname + '/dist',
  build: __dirname +  '/build',
  tscOut: __dirname + '/out-tsc',
  lib: __dirname + '/src/lib'
};

gulp.task('clean', function() {
  return del([paths.build, paths.dist, paths.tscOut]);
});

gulp.task('copy', ['clean'], function() {
  return gulp.src([
    paths.lib + '/**/*',
    '!' + paths.lib + '/**/*.spec.ts',
    __dirname + '/tsconfig.json'
  ]).pipe(gulp.dest(paths.build));
});

gulp.task('copy:project-files', ['clean'], function() {
  return gulp.src([
    __dirname + '/README.md',
    __dirname + '/LICENSE',
    __dirname + '/package.json'
  ]).pipe(gulp.dest(paths.dist));
});

gulp.task('copy:ts', ['clean'], function() {
  return gulp.src(paths.lib + '/**/*.ts').pipe(gulp.dest(paths.dist));
});

gulp.task('clean:packageJson', ['copy:project-files'], function() {
  const packageJsonPath = paths.dist + '/package.json';
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath));
  delete packageJson['scripts'];
  delete packageJson['devDependencies'];
  fs.writeFile(packageJsonPath, JSON.stringify(packageJson));
});

gulp.task('ngc', ['copy'], function() {
  return ngc(['-p', paths.build + '/tsconfig.json']);
});

gulp.task('copy:tsc', ['ngc'], function() {
  return gulp.src([
    paths.tscOut + '/build/**/*.*', paths.tscOut + '/node_modules'
  ]).pipe(gulp.dest(paths.dist));
});

// build package compiled to js
gulp.task('build', ['copy:tsc', 'copy:project-files', 'clean:packageJson'], function() {});

// build package with ts files - for development purposes
gulp.task('build:ts', ['copy:ts', 'copy:project-files', 'clean:packageJson'], function() {});

// TODO: add publish script
