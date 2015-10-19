module.exports = function (grunt) {
  grunt.registerTask('compileDev', [
    'clean:dev',
    'less:dev',
    'copy:dev',
    'browserify:dev'
  ]);

  grunt.registerTask('compileProd', [
    'clean:dev',
    'less:dev',
    'copy:dev',
    'browserify:dev',
    'uglify'
  ]);
};
