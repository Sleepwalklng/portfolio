'use strict';

var gulp         = require('gulp'),
		sass         = require('gulp-sass'),
		browserSync  = require('browser-sync').create(), //сервер
		postcss      = require('gulp-postcss'),  //нужен для работы автопрефиксера
		autoprefixer = require('autoprefixer'),  //работает под postcss, выставляет префиксы
		notify       = require('gulp-notify');



// Сборка стилей
gulp.task('style', function() {
	gulp.src('app/sass/style.scss')
		.pipe(sass({outputStyle: 'expand'})).on('error', notify.onError())
		.pipe(postcss([
			autoprefixer({browsers: [
				'last 10 versions'
			]})
		]))
		.pipe(gulp.dest('app/css'))
		.pipe(browserSync.reload({stream: true}));
});
gulp.task('serve', ['style'], function() {
	browserSync.init({
		server: 'app',
		notify: false,
		open: true,
		tunnel: false,
		cors: true,
		ui: false
	});
	gulp.watch('app/sass/**/*.{scss,sass}', ['style']);
	gulp.watch('app/*.html', browserSync.reload);
});

gulp.task('default', ['serve']);
