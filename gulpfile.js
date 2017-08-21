var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var concat = require('gulp-concat');

gulp.task('serve', ['sass:watch'], function(){
	gulp.watch("app/assets/sass/*.scss", ["sass"]);
    gulp.watch(["app/components/**/**/*.html", "app/components/**/*.html", "app/shared/**/*.html", "app/shared/**/**/*.html"]).on('change', browserSync.reload);
	gulp.watch(["app/components/**/**/*.js", "app/shared/**/*.js"]).on('change', browserSync.reload);
	browserSync.init({
		server: "./"
	});
});

gulp.task('sass', function () {
  return gulp.src([
  	'app/assets/sass/import.scss'
  	])
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('style.css'))
    .pipe(gulp.dest('app/assets/css'))
    .pipe(browserSync.stream());
});

gulp.task('sass:watch', function () {
  gulp.watch(['app/assets/sass/*.scss',
              'app/assets/sass/base/*.scss',
              'app/assets/sass/framework/*.scss',
              'app/assets/sass/modules/*.scss',
              'app/assets/sass/vendor/*.scss'], ['sass']);
});

gulp.task('default', ['serve'] , function(){});