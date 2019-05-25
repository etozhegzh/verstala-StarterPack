'use strict';

var gulp = require('gulp'),
    gp = require('gulp-load-plugins')(),
    browserSync = require('browser-sync').create();

gulp.task('serve', function() {
    browserSync.init({
        server: {
            baseDir: './build'
        }
    })
});

gulp.task('pug', function() {
    return gulp.src('src/pug/pages/*.pug')
        .pipe(gp.pug({
            pretty: true
        }))
        .pipe(gulp.dest('build'))
        .on('end', browserSync.reload);
});

gulp.task('less', function() {
    return gulp.src(['src/static/less/main.less', 
        'node_modules/@fancyapps/fancybox/dist/jquery.fancybox.min.css'])
        .pipe(gp.sourcemaps.init())
        .pipe(gp.less({}))
        .pipe(gp.autoprefixer({
            browsers: ['last 5 versions']
        }))
        .on('error', gp.notify.onError({
            message: 'Error <%= error.message %>',
            title: 'Style error'
        }))
        .pipe(gp.csso())
        .pipe(gp.sourcemaps.write())
        .pipe(gulp.dest('build/static/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

gulp.task('scripts:lib', function() {
    return gulp.src(['node_modules/jquery/dist/jquery.min.js', 
        'node_modules/slick-carousel/slick/slick.min.js',
        'node_modules/bootstrap/dist/js/bootstrap.min.js', 
        'node_modules/@fancyapps/fancybox/dist/jquery.fancybox.min.js'])
        .pipe(gp.concat('libs.min.js'))
        .pipe(gulp.dest('build/static/js/'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

gulp.task('scripts', function() {
    return gulp.src('src/static/js/main.js')
        .pipe(gulp.dest('build/static/js/'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

gulp.task('img', () =>
	gulp.src('src/static/img/*')
		.pipe(gp.imagemin())
        .pipe(gulp.dest('build/static/img/'))
        .pipe(browserSync.reload({
            stream: true
        }))
);

gulp.task('svg', () => {
    return gulp.src('./src/static/img/svg/*.svg')
        .pipe(gp.svgmin({
            js2svg: {
                pretty: true
            }
        }))
        .pipe(gp.cheerio({
            run: function($) {
                $('[fill]').removeAttr('fill');
                $('[stroke]').removeAttr('stroke');
                $('[style]').removeAttr('style');
            },
            parserOptions: { xmlMode: true }
        }))
        .pipe(gp.replace('&gt;', '>'))
        .pipe(gp.svgSprite({
            mode: {
                symbol: {
                    sprite: 'sprite.svg'
                }
            }
        }))
        .pipe(gulp.dest('./build/static/img/svg/'));
});

gulp.task('watch', function() {
    gulp.watch('src/pug/**/*.pug', gulp.series('pug'));
    gulp.watch('src/static/less/**/*.less', gulp.series('less'));
    gulp.watch('src/static/js/**/*.js', gulp.series('scripts'));
    gulp.watch('src/static/img/*', gulp.series('img'));
});

gulp.task('script', function() {
    gulp.watch('src/pug/**/*.pug', gulp.series('pug'));
    gulp.watch('src/static/less/**/*.less', gulp.series('less'));
});

gulp.task('default', gulp.series(
    gulp.parallel('pug', 'less', 'scripts:lib', 'scripts', 'img'),
    gulp.parallel('watch', 'serve')
));