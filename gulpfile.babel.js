const gulp = require("gulp");
const babel = require("gulp-babel");
const uglify = require("gulp-uglify");
const browserSync = require("browser-sync").create();
const sass = require("gulp-sass");
const autoprefixer = require("autoprefixer");
const postcss = require("gulp-postcss");
const sourcemaps = require("gulp-sourcemaps");
const notify = require("gulp-notify");
const plumber = require("gulp-plumber");

sass.compiler = require("node-sass");

const errorHandler = (err) => {
    notify.onError({
      title: `Gulp error in ${err.plugin}`,
      message: err.toString()
    })(err);
}

gulp.task("assets", function() {
  return gulp.src("./src/assets/**/*").pipe(gulp.dest("./dist/assets/"));
});

gulp.task("html", function() {
  return gulp
    .src("./src/content/*.html")
    .pipe(
      plumber(errorHandler)
    )
    .pipe(gulp.dest("./dist/"));
});

gulp.task("js", function() {
  return gulp
    .src("src/js/main.js")
    .pipe(babel())
    .on('error', errorHandler)
    .pipe(uglify())
    .on('error', errorHandler)
    .pipe(gulp.dest("dist/js"));
});

gulp.task("sass", () => {
  return gulp
    .src("./src/scss/main.scss")
    .pipe(
      plumber({
        errorHandler: function(err) {
          notify.onError({
            title: `Gulp error in ${err.plugin}`,
            message: err.toString()
          })(err);
        }
      })
    )
    .pipe(sourcemaps.init())
    .pipe(sass())
    .on("error", sass.logError)
    .pipe(
      postcss([
        autoprefixer({ grid: true, browsers: ["> 5%", "last 4 versions"] })
      ])
    )
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("./dist/css"))
    .pipe(browserSync.stream());
});

gulp.task(
  "serve",
  gulp.series("sass", "html", "js", "assets", function() {
    browserSync.init({
      server: "./dist",
      open: true // set to false to disable browser autostart
    });
    gulp.watch("src/scss/**/*", gulp.series("sass"));
    gulp.watch("src/content/*.html", gulp.series("html"));
    gulp.watch("src/js/*.js", gulp.series("js"));
    gulp.watch("src/assets/**/*", gulp.series("assets"));
    gulp.watch("dist/**/*").on("change", browserSync.reload);
  })
);

gulp.task("build", gulp.series("sass", "html", "js", "assets"));
gulp.task("default", gulp.series("serve"));