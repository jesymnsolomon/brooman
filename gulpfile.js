const { src, dest, watch, series, parallel } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const cleanCSS = require("gulp-clean-css");
const rename = require("gulp-rename");
const minify = require("gulp-minify");
const concat = require("gulp-concat");
const terser = require("gulp-terser");
const order = require("gulp-order");
const sourcemaps = require("gulp-sourcemaps");
const path = require("path");
const chokidar = require("chokidar");
const foreach = require("gulp-foreach");
const header = require('gulp-header'); // Import gulp-header

/**
 * Compiles sass files based on the given file pattern.
 * @param {string} filePattern - The file pattern that will be used for the blob.
 * @returns {Object}
 */
function compileSass(filePatterns) {
  return src(filePatterns)
    .pipe(sass().on("error", sass.logError))
    .pipe(cleanCSS())
    .pipe(dest("./assets"));
}

function transformSassToLiquidSnippet(filePatterns) {
  return src(filePatterns)
    .pipe(sass().on("error", sass.logError))
    .pipe(cleanCSS())
    .pipe(
      rename((path) => {
        // Change extension to liquid.
        path.extname = ".liquid";
      })
    )
    .pipe(dest("./snippets"));
}

// Compile a single SCSS file to CSS
function compileSection(filePath) {
  const fileName = path.basename(filePath, '.scss'); // Extract filename without extension
  console.log(`Compiling: ${filePath}`); // Log the file being compiled
  return src(filePath)
    .pipe(sourcemaps.init()) // Initialize sourcemaps
    .pipe(sass().on('error', sass.logError)) // Compile SCSS to CSS
    .pipe(cleanCSS()) // Minify CSS
    .pipe(rename(`${fileName}.css`)) // Rename to match original filename with .css extension
    .pipe(sourcemaps.write('.')) // Write sourcemaps
    .pipe(dest('./assets')); // Output to assets folder
}

// Create a function
const compileThemeStyles = compileSass.bind(this, [
  "./styles/theme.scss",
  "./styles/header.scss",
  "./styles/footer.scss",
  "./styles/hero.scss",
  "./styles/section-main-page.scss",
]);

const compileAndTransformQuickload = transformSassToLiquidSnippet.bind(
  this,
  "./styles/quickload-css.scss"
);

/**
 * Watches changes inside the styles folder.
 */
function watchStyles() {
  // Watch all files inside the styles folder (except for exclusions) and rebuild theme.css.
  watch(
    [
      "./styles/**/*.scss",
      "!./styles/(quickload-css|footer|header|header__mobile-menu|hero|blog|section-main-page).scss",
      "!./styles/sections/*.scss",
    ],
    compileSass.bind(this, "./styles/theme.scss")
  );

  // Watch these files separately and only update what is necessary.
  watch("./styles/footer.scss", compileSass.bind(this, "./styles/footer.scss"));
  watch("./styles/header.scss", compileSass.bind(this, "./styles/header.scss"));
  watch(
    "./styles/header__mobile-menu.scss",
    compileSass.bind(this, "./styles/header.scss")
  );
  watch("./styles/hero.scss", compileSass.bind(this, "./styles/hero.scss"));
  watch("./styles/blog.scss", compileSass.bind(this, "./styles/blog.scss"));
  watch(
    "./styles/section-main-page.scss",
    compileSass.bind(this, "./styles/section-main-page.scss")
  );
  watch("./styles/quickload-css.scss", compileAndTransformQuickload);

  // Watch all files inside the styles folder (except for exclusions) and rebuild theme.css.
  watch(["./scripts/gsap/*.js"], compileGSAP.bind(this, "scripts/gsap/*.js"));

  // Initialize chokidar to watch JS files in the scripts/components folder
  chokidar
    .watch("./scripts/theme/*.js", { ignored: /node_modules/ })
    .on("change", (filePath) => {
      compileJS(filePath); // Compile the changed file
    })
    .on("error", (error) => {
      console.error(`Watcher error: ${error}`);
    });

  // Initialize chokidar to watch JS files in the scripts folder
  chokidar
    .watch("./scripts/components/*.js", { ignored: /node_modules/ })
    .on("change", (filePath) => {
      compileComponents(filePath); // Compile the changed file
    })
    .on("error", (error) => {
      console.error(`Watcher error: ${error}`);
    });

  // Initialize chokidar to watch SCSS files in the sections folder
  chokidar
    .watch("./styles/sections/*.scss", { ignored: /node_modules/ })
    .on("change", (filePath) => {
      compileSection(filePath); // Compile the changed file
    })
    .on("error", (error) => {
      console.error(`Watcher error: ${error}`);
    });
}

// Define the file pattern to check
const sectionFilePattern = './styles/sections/*.scss'; // Change this to your file pattern

// Task to log file paths
function compileSectionStyles() {
  return src(sectionFilePattern).pipe(
    foreach(function (stream, file) {
      console.log("File path:", file.path);
      compileSection(file.path);
      return stream;
    })
  );
}

function compileGSAP(gsapPath) {
  return src(gsapPath)
    .pipe(sourcemaps.init())
    .pipe(concat("mfr-gsap.js"))
    .pipe(
      terser({
        format: {
          comments: false,
        },
        keep_classnames: true,
      })
    )
    .pipe(sourcemaps.write("."))
    .pipe(dest("assets"));
}

const compileThemeGSAP = compileGSAP.bind(this, "scripts/gsap/*.js");


// Compile a single JS file to JS
function compileJS(filePath) {
  const fileName = path.basename(filePath, '.js'); // Extract filename without extension
  console.log(`Compiling: ${filePath}`); // Log the file being compiled

  return src(filePath)
    .pipe(sourcemaps.init())
    .pipe(rename(`${fileName}.min.js`))
    .pipe(terser({
      format: {
        comments: false
      },
      keep_classnames: true,
    }))
    .pipe(sourcemaps.write("."))
    .pipe(dest("./assets"));
}

// Create a function
const compileThemeJS = () => {
  return src("./scripts/theme/*.js") // Get all JS files in ./scripts
    .pipe(
      foreach((stream, file) => {
        // For each file, call the compileJS function
        return compileJS(file.path); // Process the individual file
      })
    );
};

// Compile a single JS file to JS
function compileComponents(filePath) {
  const fileName = path.basename(filePath, ".js"); // Extract filename without extension
  console.log(`Compiling: ${filePath}`); // Log the file being compiled

  return src(filePath)
    .pipe(sourcemaps.init())
    .pipe(rename(`mfr-component__${fileName}.min.js`))
    .pipe(
      terser({
        format: {
          comments: false,
        },
        keep_classnames: true,
      })
    )
    .pipe(sourcemaps.write("."))
    .pipe(dest("./assets"));
}

const compileThemeComponents = () => {
  return src("./scripts/components/*.js") // Get all JS files in ./scripts
    .pipe(
      foreach((stream, file) => {
        // For each file, call the compileJS function
        return compileComponents(file.path); // Process the individual file
      })
    );
}

exports.sections = compileSectionStyles;
exports.js = compileThemeJS;
exports.gsap = compileThemeGSAP;
exports.sass = compileThemeStyles;
exports.components = compileThemeComponents;
exports.quickload = compileAndTransformQuickload;
exports.default = watchStyles;
