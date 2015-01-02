module.exports = function(grunt) {
    grunt.config.set('requirejs', {
        dev: {
            options: {
                baseUrl: "assets/js/",
                name: 'main',
                optimize: "uglify2",
                removeCombined: true,
                inlineText: true,
                useStrict: true,
                mainConfigFile: "assets/js/main.js",
                out: ".tmp/public/min/production.min.js",
                include: ['dependencies/require.js']
            }
        }
    });

    grunt.loadNpmTasks('grunt-requirejs');
};