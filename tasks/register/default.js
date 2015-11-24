module.exports = function (grunt) {
  grunt.registerTask('default', [
    'compileDev',
    'sails-linker:devJs',
    'sails-linker:devStyles',
    'focus:dev'
  ]);
};
