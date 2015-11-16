module.exports = function (grunt) {
  grunt.registerTask('test', [
    'eslint',
    'mochaTest'
  ]);
};
