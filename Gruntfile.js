module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      build: {
        src: 'app/js/app.js',
        dest: '/app/css/app.min.js',
      },
    },
    concat: {
      dist: {
        src: ['app/js/reset.js','app/js/grid.js','app/js/main.js'],
        dest: 'app/js/app.js',
      },
    },
    csslint: {
      options: {
        csslintrc: '.csslintrules',
      },
      src: ['app/css/reset.css','app/css/grid.css','app/css/main.css'],
    },
    cssmin: {
      target: {
        files: {
          'app/css/app.css': ['app/css/reset.css','app/css/grid.css','app/css/main.css']
        },
      },
    },
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
