module.exports = function (grunt) {
	grunt.registerTask('default', [
		'compileDev',
		'sails-linker:devJs',
		'sails-linker:devStyles',
		'watch:assets',
		"browserify:watch"
	]);
};
