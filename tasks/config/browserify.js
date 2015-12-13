module.exports = function (grunt) {

  grunt.config.set('browserify', {
    dev: {
      files: {
        ".tmp/public/js/app.js": "assets/app.js"
      },
      options: {
        transform: [["babelify"]],
        watch: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
};