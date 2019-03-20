'use strict';

var gulp         = require('gulp'),
		sass         = require('gulp-sass'),
		plumber      = require('gulp-plumber'),  //отлавливает ошибки, не дает упасть серверу
		browserSync  = require('browser-sync').create(), //сервер
		postcss      = require('gulp-postcss'),  //нужен для работы автопрефиксера
		autoprefixer = require('autoprefixer'),  //работает под postcss, выставляет префиксы
		mqpacker     = require('css-mqpacker'),  //перераспределятор медиавыражений, сортирует их в конец файла
		csso         = require('gulp-csso'),     //минификатор CSS
		rename       = require('gulp-rename'),   //переименовывает файлы
		concat       = require('gulp-concat'),   // собирает несколько файлов в один
		uglify       = require('gulp-uglify'),   //
		notify       = require('gulp-notify'),
		svgstore     = require('gulp-svgstore'), //собиральщик спрайта
		svgmin       = require('gulp-svgmin'),   //минификатор SVG
		imagemin     = require('gulp-imagemin'), 
		pngquant     = require('imagemin-pngquant'),
		cheerio      = require('gulp-cheerio'),
		run          = require('run-sequence'),  //запуск тасков последовательно
		del          = require('del');


// Сборка стилей
gulp.task('style', function() {
	gulp.src('app/sass/style.scss')
		.pipe(plumber())
		.pipe(sass({outputStyle: 'expand'})).on('error', notify.onError())
		.pipe(postcss([
			autoprefixer({browsers: [
				'last 2 versions'
			]}),
			mqpacker({
				sort: false //true сортирует медиастили по порядку
			})
		]))
		.pipe(gulp.dest('app/css'))//несжатый CSS
		.pipe(csso())//сжимает CSS
		.pipe(rename('style.min.css'))
		.pipe(gulp.dest('app/css'))//сжатый CSS
		.pipe(browserSync.reload({stream: true}));
});


// Сборка скриптов
gulp.task('common-js', function() {
	return gulp.src([
		'app/js/common.js',
		])
	.pipe(plumber())
	.pipe(concat('common.min.js'))
	.pipe(uglify().on('error', notify.onError()))
	.pipe(gulp.dest('app/js'));
});

gulp.task('js', ['common-js'], function() {
	return gulp.src([
		'app/libs/jquery/dist/jquery.min.js', // сюда добавляем библиотеки
		//'app/js/common.min.js', // Всегда в конце, раскоментить, если хотим склеить весь js, удалить подключение common.js в index.html
		])
	.pipe(plumber())
	.pipe(concat('scripts.min.js'))
	.pipe(uglify()) // Минимизировать весь js (на выбор)
	.pipe(gulp.dest('app/js'))
	.pipe(browserSync.reload({stream: true}));
});


// Оптимизация изображений
gulp.task('img', function () {
	return gulp.src('app/img/**/*')
		.pipe(plumber())
		.pipe(imagemin({
			optimizationLevel: 3,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		}))
		.pipe(gulp.dest('build/img'));
});


// Сборка SVG-спрайта
gulp.task('svgstore', function (callback) {
	var spritePath = 'app/img/svg-sprite';
	if(fileExist(spritePath) !== false) {
		return gulp.src(spritePath + '/*.svg')
			.pipe(svgmin(function (file) {
				return {
					plugins: [{
						cleanupIDs: {
							minify: true
						}
					}]
				};
			}))
			.pipe(svgstore({ inlineSvg: true }))
			.pipe(cheerio(function ($) {
				$('svg').attr('style',  'display:none');
			}))
			.pipe(rename('sprite-svg.svg'))
			.pipe(gulp.dest('build/img/'));
	}
	else {
		console.log('Нет файлов для сборки SVG-спрайта');
		callback();
	}
});


// Копирование шрифтов, скриптов, SVG-спрайтов и html
gulp.task('copy', function() {
	return gulp.src([
		'app/fonts/**/*.*',
		'app/js/scripts.min.js',
		'app/js/common.js',
		'app/css/style.min.css',
		'app/*.html'
	], {
		base: 'app'
	})
	.pipe(gulp.dest('build'));
});


// Очистка папки build
gulp.task('clean', function() {
	return del('build');
});


// Сборка проекта в папку build
gulp.task('build', function(fn) {
	run(
		'clean',
		'style',
		'img',
		'svgstore',
		'copy',
		fn
	);
});


// Слежение за изменениями, локальный сервер
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
	gulp.watch(['libs/**/*.js', 'app/js/common.js'], ['js']);
	gulp.watch('app/*.html', browserSync.reload);
});


// Задача по умолчанию
gulp.task('default', ['serve']);


// Проверка существования файла/папки
function fileExist(path) {
	var fs = require('fs');
	try {
		fs.statSync(path);
	} catch(err) {
		return !(err && err.code === 'ENOENT');
	}
}
