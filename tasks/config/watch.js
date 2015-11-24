/**
 * Run predefined tasks whenever watched file patterns are added, changed or deleted.
 *
 * ---------------------------------------------------------------
 *
 * Watch for changes on
 * - files in the `assets` folder
 * - the `tasks/pipeline.js` file
 * and re-run the appropriate tasks.
 *
 * For usage docs see:
 *    https://github.com/gruntjs/grunt-contrib-watch
 *
 */
module.exports = function (grunt) {

  grunt.config.set('watch', {
    api: {
      files: ['api/**/*']
    },
    less: {
      files: [
        'assets/styles/**/*'
      ],
      tasks: [
        'less:dev'
      ],
      options: {
        livereload: true,
        livereloadOnError: false
      }
    },
    js: {
      files: [
        'assets/**/*.js'
      ],
      tasks: [
        'copy:dev',
        'eslint'
      ],
      options: {
        livereload: true,
        livereloadOnError: false
      }
    }
  });

  grunt.config.set('focus', {
    dev: {
      include: ['less', 'js']
    }
  });

  grunt.loadNpmTasks('grunt-focus');
  grunt.loadNpmTasks('grunt-contrib-watch');
};
