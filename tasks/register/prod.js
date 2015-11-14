module.exports = function (grunt) {
  grunt.registerTask('prod', [
    'compileProd',
    'concat',
    'cssmin',
    'sails-linker:prodJs',
    'sails-linker:prodStyles'
  ]);
};
