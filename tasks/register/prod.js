module.exports = function (grunt) {
  grunt.registerTask('prod', [
    'compileProd',
    'concat',
    'cssmin'
  ]);
};
