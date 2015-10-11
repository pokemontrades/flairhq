var bower = require('bower');
var fsx = require('fs-extra');
var async = require('async');
var path = require('path');

/**
 * Update client-side dependencies
 */

async.auto({

  'sails.io.js': function(cb) {
    bower.commands
      .install(['sails.io.js'], {
        save: false
      }, { /* custom config */ })
      .on('end', function(installed) {
        fsx.copySync(
          path.resolve(__dirname, 'bower_components/sails.io.js/dist/sails.io.js'),
          path.resolve(__dirname, 'templates/sails.io.js')
        );
        cb();
      });
  },

  // ... future front-end dependencies here ...

},
function done(err, async_data) {
  if (err) return console.error(err);

  // Delete bower_components
  fsx.removeSync(path.resolve(__dirname, 'bower_components'));

  console.log('Done.');
});
