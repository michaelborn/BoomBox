module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      build: {
        src: 'app/css/app.css',
        dest: '/app/css/app.min.css',
      },
    }
    concat: {
      dist: {
        src: ['app/css/reset.css','app/css/grid.css','app/css/main.css'],
        dest: 'app/css/app.css',
      },
    },
  });

  // load grunt plugins
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Setup tasks to run when we execute `grunt build`
  grunt.registerTask('build', ['concat','uglify']);
};
