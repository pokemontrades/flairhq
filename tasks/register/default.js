module.exports = function (grunt) {
	grunt.registerTask('default', [
		'compileDev',
		'linkAssets',
		"browserify:watch"
	]);
};
