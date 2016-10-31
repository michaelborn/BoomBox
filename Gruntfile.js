module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    uglify: {
      options: {
        sourceMap: true,
        sourceMapIncludeSources: true,
        sourceMapIn: "app/dist/js/app.js.map"
      },
      build: {
        src: "app/dist/js/app.js",
        dest: "app/dist/js/app.min.js"
      }
    },
    concat: {
      options: {
        sourceMap: true
      },
      dist: {
        src: ["app/js/api.js","app/js/lib.js","app/js/app.js","app/js/main.js"],
        dest: "app/dist/js/app.js"
      },
    },
    jshint: {
      beforeconcat: ["app/js/api.js","app/js/main.js","app/js/lib.js","app/js/app.js","organize/ripdisc.js","api/routes.js"]
    },
    csslint: {
      options: {
        csslintrc: ".csslintrules",
        sourceMap: true
      },
      src: ["app/css/reset.css","app/css/grid.css","app/css/main.css"]
    },
    cssmin: {
      target: {
        files: {
          "app/dist/css/app.min.css": ["app/css/reset.css","app/css/grid.css","app/css/main.css"]
        }
      }
    },
    jsdoc: {
      dist: {
        src: ["organize/ripdisc.js", "api/*.js", "app/js/api.js", "app/js/lib.js"],
        options: {
          destination: "docs"
        }
      }
    }
  });

  // load grunt plugins
  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-cssmin");
  grunt.loadNpmTasks("grunt-contrib-csslint");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-jsdoc");

  // Setup tasks to run when we execute `grunt build`
  grunt.registerTask("css", ["csslint","cssmin"]);
  grunt.registerTask("js", ["concat","jshint","uglify"]);
}
