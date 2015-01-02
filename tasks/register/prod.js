module.exports = function (grunt) {
	grunt.registerTask('prod', [
		'compileAssets',
		'concat',
		'cssmin',
		'sails-linker:prodJs',
		'sails-linker:prodStyles'
	]);
};
