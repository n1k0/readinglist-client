/* jshint node:true */

"use strict";

var gulp = require("gulp");
var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var webserver = require("gulp-webserver");

var opt = {
  outputFolder: "build",
  server: {
    host: "localhost",
    port: 4000,
    livereload: true,
    open: true
  },
  cssAssets: [
    "node_modules/bootstrap/dist/css/bootstrap.css",
    "src/css/styles.css"
  ],
  jsAssets: [
    "src/js/**/*.*"
  ],
  htmlAssets: [
    "src/index.html"
  ],
  app: {
    src: "src/js/app.jsx",
    dest: "app.js"
  },
  vendors: "vendors.js"
};

/**
 * Assets tasks
 */
gulp.task("assets", [
  "assets:html",
  "assets:css"
]);

gulp.task("assets:html", function() {
  return gulp.src(opt.htmlAssets)
    .pipe(gulp.dest(opt.outputFolder));
});

gulp.task("assets:css", function() {
  return gulp.src(opt.cssAssets)
    .pipe(gulp.dest(opt.outputFolder + "/css"));
});

/**
 * JS tasks
 */

gulp.task("js", ["js:vendors", "js:app"]);

gulp.task("js:app", ["js:vendors"], function() {
  return browserify("./" + opt.app.src)
    .transform("reactify")
    .external("react")
    .external("react-bootstrap")
    .bundle()
    .pipe(source(opt.app.dest))
    .pipe(gulp.dest(opt.outputFolder + "/js"));
});

gulp.task("js:vendors", function() {
  return browserify()
    .require("react")
    .require("react-bootstrap")
    .bundle()
    .pipe(source(opt.vendors))
    .pipe(gulp.dest(opt.outputFolder + "/js"));
});


/**
 * Server task
 */
gulp.task("server", function() {
   return gulp.src(opt.outputFolder)
    .pipe(webserver(opt.server));
});

/**
 * Watchify
 */

gulp.task("watchify", function(){

  var b = browserify( "./" + opt.app.src , watchify.args)
    .transform("reactify")
    .external("react")
    .external("react-bootstrap")
    .external("marked");


  function updateBundle(w){

    return w.bundle()
      .pipe(source(opt.app.dest))
      .pipe(gulp.dest(opt.outputFolder + "/js"));
  }

  var watcher= watchify(b);
  watcher.on("update", function(){
    updateBundle(watcher);
  });

  return updateBundle(watcher);

});

/**
 * Watch task
 * Launch a server with livereload
 */
gulp.task("watch", ["assets","js:vendors", "watchify"], function() {
  gulp.watch(opt.cssAssets,  ["assets:css"]);
  gulp.watch(opt.fontAssets, ["assets:fonts"]);
  gulp.watch(opt.htmlAssets, ["assets:html"]);
});

gulp.task("dist", ["assets", "js"], function() {
  return gulp.src(opt.outputFolder + "/js/*.js")
    .pipe(uglify())
    .pipe(gulp.dest(opt.outputFolder + "/js"));
});

gulp.task("default", ["server", "watch"]);
