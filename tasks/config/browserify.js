module.exports = function (grunt) {

  grunt.config.set('browserify', {
    dev: {
      files: {
        ".tmp/public/js/app.js": "assets/js/app.js"
      },
      options: {
        transform: [["babelify"]]
      }
    },
    watch: {
      files: {
        ".tmp/public/js/app.js": "assets/js/app.js"
      },
      options: {
        transform: [["babelify"]],
        watch: true,
        keepAlive: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
};