module.exports = function (grunt) {
  grunt.registerTask('prod', [
    'compileProd',
    'concat',
    'uglify',
    'cssmin',
    'sails-linker:prodJs',
    'sails-linker:prodStyles'
  ]);
};
