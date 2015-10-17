module.exports = function (grunt) {
	grunt.registerTask('default', [
		'compileDev',
		'linkAssets',
		'watch'
	]);
};
