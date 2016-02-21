"use strict";

var gulp = require('gulp');
var connect = require('gulp-connect');
var open = require('gulp-open');
var clean = require('gulp-clean');
var buffer = require('gulp-buffer');
var request = require('request');
var merge = require('merge2');
var browserify = require('browserify');
var reactify = require('reactify');
var source = require('vinyl-source-stream');
var concat = require('gulp-concat');
var lint = require('gulp-eslint');
var cordova = require('cordova-lib').cordova;
var sass = require('gulp-sass');
var decompress = require('gulp-decompress');

var config = {
    port: 3000,
    devBaseUrl: 'http://localhost',
/*  toolkit:{
        url: ' ',
        version: '1.3.3',  
        filename: ''
    },*/

    paths: {
        html: 'src/*.html',
        js: [
            'src/**/*.js'
        ],
        images: 'src/images/*',
        css: [
            'src/css/*.css'
        ],
        sass: 'src/sass/application.scss',
        mainJs: 'src/main.js',
        dist: 'www/'
    }
}

gulp.task('connect', function() {
    connect.server({
        root: ['www'],
        port: config.port,
        base: config.devBaseUrl,
        livereload:true
    });
});

gulp.task('open',['connect'], function() {
    gulp.src('www/index.html')
    .pipe(open({uri: config.devBaseUrl + ':' + config.port + '/'}));
});

gulp.task('html', function() {
    gulp.src(config.paths.html)
    .pipe(gulp.dest(config.paths.dist))
    .pipe(connect.reload());
});

gulp.task('js', function() {
    browserify(config.paths.mainJs)
    .transform(reactify)
    .bundle()
    .on('error', console.error.bind(console))
    .pipe(source('bundle.js'))
    .pipe(gulp.dest(config.paths.dist + '/scripts'))
    .pipe(connect.reload());
});

/* gulp.task('download-toolkit', function(){
    var toolkit = config.toolkit,
        url = toolkit.url + toolkit.version + '/' + toolkit.filename;

    request(url)
     //   .pipe(source('assets.zip'))
        .pipe(gulp.dest(config.paths.dist));

  //  return gulp.src(config.paths.dist + 'assets.zip')
    //    .pipe(decompress())
      //  .pipe(gulp.dest(config.paths.dist));
});
*/

gulp.task('css',  function() {
    var app = gulp.src(config.paths.css),
        sassSource = gulp.src(config.paths.sass).pipe(sass().on('error', sass.logError));

    return merge(app, sassSource)
        .pipe(buffer())
        .pipe(concat('bundle.css'))
        .pipe(gulp.dest(config.paths.dist + '/css'))
        .pipe(connect.reload());
});

gulp.task('images', function() {
    gulp.src(config.paths.images)
    .pipe(gulp.dest(config.paths.dist + '/images'));

    gulp.src('./src/favicon.ico')
    .pipe(gulp.dest(config.paths.dist));
});

gulp.task('build', function(callback){
    cordova.build({
        "platforms": ["ios"],
        "options": ["--release","--gradleArgs=--no-daemon"]
    }, callback);
});

gulp.task('run', function(callback){
    cordova.emulate({
        "platforms": ["ios"],
        "options": ["--target=iPad-Air"]
    }, callback);
});

gulp.task('clean-html', function() {
    return gulp.src(config.paths.dist + '/index.html', {read:false})
    .pipe(clean());
});

gulp.task('clean-scripts', function() {
    return gulp.src(config.paths.dist + '/scripts/*.*', {read:false})
    .pipe(clean());
});

gulp.task('clean-css', function() {
    return gulp.src(config.paths.dist + '/css/*.*', {read:false})
    .pipe(clean());
});

gulp.task('clean-images', function() {
    return gulp.src(config.paths.dist + '/images/*.*', {read:false})
    .pipe(clean());
});

/* gulp.task('clean-toolkit', function() {
    return gulp.src(config.paths.dist + '/ui-toolkit', {read:false})
    .pipe(clean());
});
*/

gulp.task('clean',[
    'clean-html',
    'clean-scripts',
    'clean-css',
    'clean-images' ]);

gulp.task('lint', function(){
    return gulp.src(config.paths.js)
    .pipe(lint({config:'eslint.config.json'}))
    .pipe(lint.format());
});

gulp.task('watch', function() {
    gulp.watch(config.paths.html, ['html']);
    gulp.watch(config.paths.js, ['js','lint']);
    gulp.watch(config.paths.css, ['css']);
    gulp.watch('src/sass/**/*.scss', ['css']);
});

gulp.task('build', ['clean', 'html','js','images','css']);
gulp.task('default', ['build','open','watch']);
