import fs from "fs";
import path from "path";
import gulp from "gulp";
import del from "del";
import runSequence from "run-sequence";
import browserSync from "browser-sync";
import swPrecache from "sw-precache";
import gulpLoadPlugins from "gulp-load-plugins";
import {
  output as pagespeed
} from "psi";
import pkg from "./package.json";
import htmlbeautify from "gulp-html-beautify";

import surge from "gulp-surge";

var handlebars = require("handlebars");
var gulpHandlebars = require("gulp-handlebars-html")(handlebars); //default to require('handlebars') if not provided
var rename = require("gulp-rename");

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

// Optimize images
gulp.task("images", () =>
  gulp
  .src("app/images/**/*")
  .pipe(
    $.cache(
      $.imagemin({
        progressive: true,
        interlaced: true
      })
    )
  )
  .pipe(gulp.dest("dist/images"))
  .pipe($.size({
    title: "images"
  }))
);

// Copy all files at the root level (app)
gulp.task("copy", () =>
  gulp
  .src(["app/*", "!app/*.html", "node_modules/apache-server-configs/dist/.htaccess"], {
    dot: true
  })
  .pipe(gulp.dest("dist"))
  .pipe($.size({
    title: "copy"
  }))
);

// Compile and automatically prefix stylesheets
gulp.task("styles", () => {
  const AUTOPREFIXER_BROWSERS = [
    "ie >= 10",
    "ie_mob >= 10",
    "ff >= 30",
    "chrome >= 34",
    "safari >= 7",
    "opera >= 23",
    "ios >= 7",
    "android >= 4.4",
    "bb >= 10"
  ];

  // For best performance, don't add Sass partials to `gulp.src`
  return (
    gulp
    .src(["app/styles/**/*.scss", "app/styles/**/*.css"])
    .pipe($.newer(".tmp/styles"))
    .pipe($.sourcemaps.init())
    .pipe(
      $.sass({
        precision: 10
      }).on("error", $.sass.logError)
    )
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest(".tmp/styles"))
    // Concatenate and minify styles
    .pipe($.if("*.css", $.cssnano()))
    .pipe($.size({
      title: "styles"
    }))
    .pipe($.sourcemaps.write("./"))
    .pipe(gulp.dest("dist/styles"))
    .pipe(gulp.dest(".tmp/styles"))
  );
});

// Concatenate and minify JavaScript. Optionally transpiles ES2015 code to ES5.
// to enable ES2015 support remove the line `"only": "gulpfile.babel.js",` in the
// `.babelrc` file.
gulp.task("scripts", () =>
  gulp
  .src([
    "./app/scripts/main.js"
  ])
  .pipe($.newer(".tmp/scripts"))
  .pipe($.sourcemaps.init())
  .pipe($.babel())
  .pipe($.sourcemaps.write())
  .pipe(gulp.dest(".tmp/scripts"))
  .pipe($.concat("main.min.js"))
  .pipe($.uglify())
  // Output files
  .pipe($.size({
    title: "scripts"
  }))
  .pipe($.sourcemaps.write("."))
  .pipe(gulp.dest("dist/scripts"))
  .pipe(gulp.dest(".tmp/scripts"))
);

// Js task 
gulp.task('js', () =>
  gulp.src('app/js/**/*.js')
  .pipe($.sourcemaps.init())
  .pipe($.babel({
    presets: ['env'],
    plugins: ['transform-runtime']
  }))
  .pipe($.concat('app.js'))
  .pipe($.sourcemaps.write('.'))
  .pipe(gulp.dest("dist/scripts"))
  .pipe(gulp.dest(".tmp/scripts"))
);

// Js task 
gulp.task('js-min', () =>
  gulp.src('app/js/**/*.js')
  .pipe($.sourcemaps.init())
  .pipe($.babel({
    presets: ['env'],
    plugins: ['transform-runtime']
  }))
  .pipe($.concat('app.min.js'))
  .pipe($.uglify())
  .pipe($.sourcemaps.write('.'))
  .pipe(gulp.dest("dist/scripts"))
  .pipe(gulp.dest(".tmp/scripts"))
);

// Scan your HTML for assets & optimize them
gulp.task("html", () => {
  return (
    gulp
    .src("app/**/*.html")
    .pipe(
      $.useref({
        searchPath: "{.tmp,app}",
        noAssets: true
      })
    )
    // Minify any HTML
    .pipe(
      $.if(
        "*.html",
        $.htmlmin({
          removeComments: true,
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeAttributeQuotes: true,
          removeRedundantAttributes: true,
          removeEmptyAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          removeOptionalTags: true
        })
      )
    )
    // Output files
    .pipe($.if("*.html", $.size({
      title: "html",
      showFiles: true
    })))
    .pipe(gulp.dest("dist"))
  );
});


//Handlerbar
gulp.task("hbs", function () {
  //Multi only parent dir
  function getDir(path) {
    return fs.readdirSync(path).filter(function (file) {
      return fs.statSync(path + '/' + file).isDirectory();
    });
  }

  var template_Arr = getDir(path.join(__dirname, "app/template"));
  template_Arr.forEach(dir => {
    fs.readdirSync("./app/template/" + dir).forEach(i => {
      i.split(".")[1] && new RegExp(i.split(".")[1]).test(i) && reg(i, i.split(".")[0], dir);
    });
  });

  /**	
   * Register HandlerbarPartial
   * @param i String  - ex: footer.html
   * @param name Sring - ex: footer
   * @param dirname String - ex: about
   */
  function reg(i, name, dirname) {
    //console.log(i);
    let dirFile = path.join("./app/template/" + dirname, i);
    var file = fs.readFileSync(dirFile);
    handlebars.registerPartial(name, file.toString());
  }

  return gulp
    .src("app/template/index.html")
    .pipe(gulpHandlebars())
    .pipe(rename("index.html"))
    .pipe(htmlbeautify())
    .pipe(gulp.dest("app"));
});

gulp.task("watch:hbs", () => {
  gulp.watch(["app/template/**/*.html"], ["hbs"]);
});

// Clean output directory
gulp.task("clean", () => del([".tmp", "dist/*", "!dist/.git"], {
  dot: true
}));

// Default Watch files for changes & reload
gulp.task("default", ["clean", "js", "scripts", "styles", "hbs"], () => {
  browserSync({
    notify: false,
    // Customize the Browsersync console logging prefix
    logPrefix: "➡️ Oh-Yeahhhhhhh",
    // Allow scroll syncing across breakpoints
    //scrollElementMapping: ['main', '.mdl-layout'],
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: [".tmp", "app"],
    port: 3000
  });

  gulp.watch(["app/**/*.html"], reload);
  gulp.watch(["app/styles/**/*.{scss,css}"], ["styles", reload]);
  gulp.watch(["app/scripts/**/*.js"], ["scripts", reload]);
  gulp.watch(["app/js/**/*.js"], ["js", reload]);
  gulp.watch(["app/images/**/*"], reload);
  gulp.watch(["app/template/**/*.html"], ["hbs", reload]);
});

// Build and serve the output from the dist build
gulp.task("serve:dist", ["default"], () =>
  browserSync({
    notify: false,
    logPrefix: "Build ⛴",
    server: "dist",
    port: 3001
  })
);

gulp.task("surge", [], function () {
  if (!process.argv[4]) {
    console.log("Error!!! check syntax -> : gulp surge -d [name] ");
    console.log("Ex: gulp surge -d maple-gulp");
    process.exit(0);
  }
  console.log("Input only name : ex maple-gulp");
  return surge({
    project: "./dist", // Path to your static build directory
    domain: process.argv[4] + ".surge.sh" // Your domain or Surge subdomain
  });
});

// Build production files, the default task
gulp.task("build", ["clean"], cb =>
  runSequence("styles", ["html", "js-min", "scripts", "images", "copy"], "generate-service-worker", cb)
);

// Run PageSpeed Insights
// gulp pagespeed -m [desktop or mobile]
gulp.task("pagespeed", cb => {
  console.log("Input domain to check [ex: maplestudio.vn]: ");
  var stdin = process.openStdin();
  stdin.addListener("data", function(d) {
    console.log("Wait...");
      var _d = d.toString().trim();
      pagespeed(
        "http://"+ _d, {
          strategy: process.argv[4] 
        },
        cb
      ).then(()=>{
        console.log("DONE!");
        process.exit(0);
      });
    });
});

// Copy over the scripts that are used in importScripts as part of the generate-service-worker task.
gulp.task("copy-sw-scripts", () => {
  return gulp
    .src(["node_modules/sw-toolbox/sw-toolbox.js", "app/scripts/sw/runtime-caching.js"])
    .pipe(gulp.dest("dist/scripts/sw"));
});

// See http://www.html5rocks.com/en/tutorials/service-worker/introduction/ for
// an in-depth explanation of what service workers are and why you should care.
// Generate a service worker file that will provide offline functionality for
// local resources. This should only be done for the 'dist' directory, to allow
// live reload to work as expected when serving from the 'app' directory.
gulp.task("generate-service-worker", ["copy-sw-scripts"], () => {
  const rootDir = "dist";
  const filepath = path.join(rootDir, "service-worker.js");

  return swPrecache.write(filepath, {
    // Used to avoid cache conflicts when serving on localhost.
    cacheId: pkg.name || "web-starter-kit",
    // sw-toolbox.js needs to be listed first. It sets up methods used in runtime-caching.js.
    importScripts: ["scripts/sw/sw-toolbox.js", "scripts/sw/runtime-caching.js"],
    staticFileGlobs: [
      // Add/remove glob patterns to match your directory setup.
      `${rootDir}/images/**/*`,
      `${rootDir}/scripts/**/*.js`,
      `${rootDir}/styles/**/*.css`,
      `${rootDir}/*.{html,json}`
    ],
    // Translates a static file path to the relative URL that it's served from.
    // This is '/' rather than path.sep because the paths returned from
    // glob always use '/'.
    stripPrefix: rootDir + "/"
  });
});

// Load custom tasks from the `tasks` directory
// Run: `npm install --save-dev require-dir` from the command-line
// try { require('require-dir')('tasks'); } catch (err) { console.error(err); }