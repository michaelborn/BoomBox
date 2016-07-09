module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      build: {
        src: 'app/js/app.js',
        dest: 'app/dist/js/app.min.js'
      }
    },
    concat: {
      options: {
        sourceMap: true
      },
      dist: {
        src: ['app/js/api.js','app/js/lib.js','app/js/main.js'],
        dest: 'app/dist/js/app.js'
      },
    },
    jshint: {
      beforeconcat: ['app/js/api.js','app/js/main.js','app/js/lib.js']
    },
    csslint: {
      options: {
        csslintrc: '.csslintrules',
        sourceMap: true
      },
      src: ['app/css/reset.css','app/css/grid.css','app/css/main.css']
    },
    cssmin: {
      target: {
        files: {
          'app/dist/css/app.min.css': ['app/css/reset.css','app/css/grid.css','app/css/main.css']
        }
      }
    }
  });

  // load grunt plugins
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-csslint');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Setup tasks to run when we execute `grunt build`
  grunt.registerTask('css', ['csslint','cssmin']);
  grunt.registerTask('js', ['concat','jshint','uglify']);
}
