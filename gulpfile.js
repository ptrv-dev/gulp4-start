"use strict";

const { src, dest, parallel, series, watch } = require('gulp');
const bsync = require('browser-sync').create();
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const gcmq = require('gulp-group-css-media-queries');
const rename = require('gulp-rename');
const del = require('del');
const uglify = require('gulp-uglify');
const pug = require('gulp-pug');
const img = require('gulp-image');
const ghPages = require('gulp-gh-pages');

function distDel() {
	return del('./dist/');
}

function browserSync() {
	bsync.init({
		server: { baseDir: './dist/' },
		notify: false,
		online: true
	})
}

function style() {
	return src('./src/scss/**/*.scss')
		.pipe(sass({ outputStyle: "compressed" }))
		.pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'] }))
		.pipe(gcmq())
		.pipe(rename({ suffix: '.min' }))
		.pipe(dest('./dist/css/'))
		.pipe(bsync.stream())
}

function script() {
	return src('./src/js/**/*.js')
		.pipe(uglify())
		.pipe(rename({ suffix: '.min' }))
		.pipe(dest('./dist/js/'))
		.pipe(bsync.stream())
}

function html() {
	return src('./src/pages/*.pug')
		.pipe(pug())
		.pipe(dest('./dist/'))
		.pipe(bsync.stream())
}

function fonts() {
	return src('./src/fonts/**/*.{ttf,woff,woff2,eot}')
		.pipe(dest('./dist/fonts/'))
		.pipe(bsync.stream())
}

function libs() {
	return src('./src/libs/**/*')
		.pipe(dest('./dist/libs/'))
		.pipe(bsync.stream())
}

function image() {
	return src('./src/img/**/*.{jpeg,jpg,png,svg,gif,ico}')
		.pipe(img())
		.pipe(dest('./dist/img/'))
		.pipe(bsync.stream())
}

function startWatch() {
	watch('./src/**/*.pug', html);
	watch('./src/scss/**/*.scss', style);
	watch('./src/js/**/*.js', script);
	watch('./src/libs/**/*', libs);
	watch('./src/fonts/**/*.{ttf,woff,woff2,eot}', fonts);
	watch('./src/img/**/*.{jpeg,jpg,png,svg,gif,ico}', image);
}

function ghDeploy() {
	return src('./dist/**/*')
		.pipe(ghPages())
}

exports.default = series(html, style, script, libs, fonts, parallel(browserSync, startWatch));
exports.build = series(distDel, html, style, script, libs, fonts, image);
exports.deploy = series(series(distDel, html, style, script, libs, fonts, image), ghDeploy);